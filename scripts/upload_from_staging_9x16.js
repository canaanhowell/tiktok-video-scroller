#!/usr/bin/env node
// Upload 9x16 videos from staging directories with metadata from batch_videos.json
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

// Load metadata from batch_videos.json
let videoMetadata = {};
try {
  const batchData = JSON.parse(fs.readFileSync('/app/main/staging_app/input/batch_videos.json', 'utf8'));
  batchData.forEach(video => {
    if (video.resolution === '9x16') {
      videoMetadata[video.filename] = video;
    }
  });
  console.log(`📋 Loaded metadata for ${Object.keys(videoMetadata).length} 9x16 videos from batch_videos.json\n`);
} catch (e) {
  console.log('❌ Could not load batch_videos.json:', e.message);
  process.exit(1);
}

// Category configurations
const CATEGORIES = {
  venues: {
    envPrefix: 'venues',
    directory: '/app/main/staging_app/input/venues/9x16'
  },
  photographers: {
    envPrefix: 'photography',
    directory: '/app/main/staging_app/input/photographers/9x16'
  },
  videographers: {
    envPrefix: 'videographers',
    directory: '/app/main/staging_app/input/videographers/9x16'
  },
  musicians: {
    envPrefix: 'musicians',
    directory: '/app/main/staging_app/input/musicians/9x16'
  },
  djs: {
    envPrefix: 'dj',
    directory: '/app/main/staging_app/input/djs/9x16'
  }
};

// Truncate library
async function truncateLibrary(category, envPrefix) {
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${envPrefix}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${envPrefix}_9x16`];
  
  console.log(`🗑️  Truncating ${category} library...`);
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100`,
      {
        headers: {
          'AccessKey': apiKey,
          'accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const videos = data.items || [];
      
      for (const video of videos) {
        await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${video.guid}`,
          {
            method: 'DELETE',
            headers: { 'AccessKey': apiKey }
          }
        );
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`   ✅ Deleted ${videos.length} videos\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

// Upload video with metadata
async function uploadVideo(category, envPrefix, videoPath, metadata) {
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${envPrefix}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${envPrefix}_9x16`];
  
  console.log(`   📹 ${metadata.title}`);
  console.log(`      Vendor: ${metadata.vendor}`);
  console.log(`      Location: ${metadata.city}, ${metadata.state}`);
  
  try {
    // Create video
    const createResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: metadata.title })
      }
    );
    
    if (!createResponse.ok) {
      console.log(`      ❌ Failed to create: ${createResponse.status}`);
      return false;
    }
    
    const created = await createResponse.json();
    
    // Add metadata using moments
    const moments = [
      { label: `category:${metadata.category}`, timestamp: 0 },
      { label: `vendorName:${metadata.vendor}`, timestamp: 0 },
      { label: `vendorWebsite:www.${metadata.vendor.toLowerCase().replace(/\s+/g, '')}.com`, timestamp: 0 },
      { label: `vendorCity:${metadata.city}`, timestamp: 0 },
      { label: `vendorState:${metadata.state}`, timestamp: 0 },
      { label: `vendorZipcode:${metadata.zipcode}`, timestamp: 0 }
    ];
    
    await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${created.guid}`,
      {
        method: 'POST',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moments })
      }
    );
    
    // Upload file
    const fileStream = fs.createReadStream(videoPath);
    const fileSize = fs.statSync(videoPath).size;
    
    console.log(`      📤 Uploading ${Math.round(fileSize / 1024 / 1024)}MB...`);
    
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${created.guid}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'video/mp4',
          'Content-Length': fileSize
        },
        body: fileStream,
        duplex: 'half'
      }
    );
    
    if (uploadResponse.ok) {
      console.log(`      ✅ Success`);
      return true;
    } else {
      console.log(`      ❌ Upload failed: ${uploadResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`      ❌ Error: ${error.message}`);
    return false;
  }
}

// Process category
async function processCategory(category, config) {
  console.log(`\n📁 Processing ${category.toUpperCase()}`);
  console.log('=' .repeat(50));
  
  // Check if directory exists
  if (!fs.existsSync(config.directory)) {
    console.log(`   ❌ Directory not found: ${config.directory}`);
    console.log(`   📭 Skipping this category\n`);
    return;
  }
  
  // Find videos in directory
  const videos = fs.readdirSync(config.directory)
    .filter(f => f.endsWith('.mp4'))
    .map(f => ({
      filename: f,
      path: path.join(config.directory, f)
    }));
  
  console.log(`   📊 Found ${videos.length} videos in ${config.directory}\n`);
  
  if (videos.length === 0) {
    console.log(`   📭 No videos to upload\n`);
    return;
  }
  
  // Truncate library first
  await truncateLibrary(category, config.envPrefix);
  
  // Upload videos
  let uploaded = 0;
  let skipped = 0;
  
  for (const video of videos) {
    const metadata = videoMetadata[video.filename];
    
    if (!metadata) {
      console.log(`   ⚠️  No metadata found for ${video.filename}, skipping...\n`);
      skipped++;
      continue;
    }
    
    if (metadata.category !== category) {
      console.log(`   ⚠️  Category mismatch for ${video.filename}`);
      console.log(`      Expected: ${category}, Found: ${metadata.category}`);
      console.log(`      Skipping...\n`);
      skipped++;
      continue;
    }
    
    const success = await uploadVideo(category, config.envPrefix, video.path, metadata);
    if (success) uploaded++;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n   ✅ Uploaded: ${uploaded}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   📁 Total: ${videos.length}`);
}

async function main() {
  console.log('🎬 Uploading 9x16 Videos from Staging Directories\n');
  console.log('=' .repeat(60));
  console.log('\nUsing:');
  console.log('   📁 Directories: staging_app/input/[category]/9x16');
  console.log('   📋 Metadata: staging_app/input/batch_videos.json\n');
  
  // Process each category
  for (const [category, config] of Object.entries(CATEGORIES)) {
    await processCategory(category, config);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ All categories processed!');
  console.log('\n📱 Test each category:');
  for (const category of Object.keys(CATEGORIES)) {
    console.log(`   https://media.synthetikmedia.ai/${category}`);
  }
}

main().catch(console.error);