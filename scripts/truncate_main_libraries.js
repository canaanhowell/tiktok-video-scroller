// Truncate only the main 9x16 and 16x9 libraries
require('dotenv').config({ path: '/app/main/web_app/.env' });

const MAIN_LIBRARIES = {
  '16x9': {
    id: process.env.bunny_cdn_video_streaming_library_16x9,
    key: process.env.bunny_cdn_video_streaming_key_16x9
  },
  '9x16': {
    id: process.env.bunny_cdn_video_streaming_library_9x16,
    key: process.env.bunny_cdn_video_streaming_key_9x16
  }
};

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
    console.log(`  ⚠️  Skipping ${name} - missing ${!config.id ? 'library ID' : 'API key'}`);
    return { deleted: 0, failed: 0 };
  }
  
  console.log(`\n📁 Processing ${name} (ID: ${config.id}):`);
  
  try {
    // Get all videos
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
    
    console.log(`  🗑️  Found ${videos.length} videos to delete`);
    
    let deleted = 0;
    let failed = 0;
    
    // Delete videos in batches
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

async function truncateMainLibraries() {
  console.log('🗑️  Truncating Main Bunny CDN Libraries (9x16 and 16x9)\n');
  console.log('=' .repeat(60));
  
  let totalDeleted = 0;
  let totalFailed = 0;
  
  for (const [name, config] of Object.entries(MAIN_LIBRARIES)) {
    const result = await truncateLibrary(name, config);
    totalDeleted += result.deleted;
    totalFailed += result.failed;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`Total videos deleted: ${totalDeleted}`);
  console.log(`Total failures: ${totalFailed}`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some videos failed to delete. You may need to try again.');
  } else if (totalDeleted > 0) {
    console.log('\n✅ Main libraries successfully truncated!');
  } else {
    console.log('\n✅ Main libraries were already empty!');
  }
}

// Run the truncation
console.log('⚠️  This will DELETE all videos from the main 16x9 and 9x16 libraries!');
console.log('Starting in 3 seconds...\n');

setTimeout(() => {
  truncateMainLibraries().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}, 3000);