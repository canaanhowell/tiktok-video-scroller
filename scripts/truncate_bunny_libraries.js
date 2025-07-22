// Truncate (delete all videos from) all Bunny CDN libraries
const { LIBRARIES } = require('./list_bunny_videos_final.js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteVideo(libraryId, videoId, apiKey) {
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          'AccessKey': apiKey,
          'accept': 'application/json'
        }
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error(`Error deleting video ${videoId}:`, error.message);
    return false;
  }
}

async function truncateLibrary(name, config) {
  if (!config.id || !config.key) {
    console.log(`  ⚠️  Skipping - missing ${!config.id ? 'library ID' : 'API key'}`);
    return { deleted: 0, failed: 0 };
  }
  
  try {
    // First, get all videos
    const response = await fetch(
      `https://video.bunnycdn.com/library/${config.id}/videos?page=1&itemsPerPage=1000`,
      {
        headers: {
          'AccessKey': config.key,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`  ❌ Error fetching videos: ${response.status}`);
      return { deleted: 0, failed: 0 };
    }
    
    const data = await response.json();
    const videos = data.items || [];
    
    if (videos.length === 0) {
      console.log(`  ✅ Already empty`);
      return { deleted: 0, failed: 0 };
    }
    
    console.log(`  🗑️  Deleting ${videos.length} videos...`);
    
    let deleted = 0;
    let failed = 0;
    
    // Delete videos in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize);
      const deletePromises = batch.map(video => 
        deleteVideo(config.id, video.guid, config.key)
      );
      
      const results = await Promise.all(deletePromises);
      deleted += results.filter(r => r).length;
      failed += results.filter(r => !r).length;
      
      // Progress indicator
      process.stdout.write(`\r  🗑️  Progress: ${deleted + failed}/${videos.length} (${deleted} deleted, ${failed} failed)`);
      
      // Small delay between batches
      if (i + batchSize < videos.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(''); // New line after progress
    console.log(`  ✅ Completed: ${deleted} deleted, ${failed} failed`);
    
    return { deleted, failed };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { deleted: 0, failed: 0 };
  }
}

async function truncateAllLibraries() {
  console.log('🗑️  Bunny CDN Library Truncation Tool\n');
  console.log('=' .repeat(60) + '\n');
  
  // First, show what we'll delete
  console.log('📊 Libraries to truncate:');
  let totalVideos = 0;
  const librariesToTruncate = [];
  
  for (const [name, config] of Object.entries(LIBRARIES)) {
    if (config.id && config.key) {
      try {
        const response = await fetch(
          `https://video.bunnycdn.com/library/${config.id}/videos?page=1&itemsPerPage=1`,
          {
            headers: {
              'AccessKey': config.key,
              'accept': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const count = data.totalItems || 0;
          if (count > 0) {
            console.log(`   ${name}: ${count} videos`);
            totalVideos += count;
            librariesToTruncate.push({ name, config, count });
          }
        }
      } catch (error) {
        // Ignore errors in counting
      }
    }
  }
  
  if (totalVideos === 0) {
    console.log('\n✅ All libraries are already empty!');
    process.exit(0);
  }
  
  console.log(`\n⚠️  This will DELETE ${totalVideos} videos across ${librariesToTruncate.length} libraries!`);
  console.log('This action cannot be undone.\n');
  
  const answer = await new Promise(resolve => {
    rl.question('Type "DELETE ALL VIDEOS" to confirm: ', resolve);
  });
  
  if (answer !== 'DELETE ALL VIDEOS') {
    console.log('\n❌ Cancelled - no videos were deleted.');
    rl.close();
    process.exit(0);
  }
  
  console.log('\n🚀 Starting truncation...\n');
  
  let totalDeleted = 0;
  let totalFailed = 0;
  
  for (const { name, config } of librariesToTruncate) {
    console.log(`\n📁 ${name}:`);
    const result = await truncateLibrary(name, config);
    totalDeleted += result.deleted;
    totalFailed += result.failed;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`Total videos deleted: ${totalDeleted}`);
  console.log(`Total failures: ${totalFailed}`);
  console.log(`Libraries truncated: ${librariesToTruncate.length}`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some videos failed to delete. You may need to try again.');
  } else {
    console.log('\n✅ All libraries successfully truncated!');
  }
  
  rl.close();
}

// Run the truncation
truncateAllLibraries().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});