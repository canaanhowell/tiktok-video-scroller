#!/usr/bin/env node
// Upload videos to main Bunny CDN libraries (9x16 and 16x9) with proper metadata
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

// Load batch videos JSON
const batchFile = '/app/main/staging_app/input/batch_videos.json';
const allVideos = JSON.parse(fs.readFileSync(batchFile, 'utf8'));

// Main libraries configuration
const MAIN_LIBRARIES = {
  '16x9': {
    id: process.env.bunny_cdn_video_streaming_library_16x9,
    key: process.env.bunny_cdn_video_streaming_key_16x9,
    hostname: 'vz-97606b97-31d.b-cdn.net'
  },
  '9x16': {
    id: process.env.bunny_cdn_video_streaming_library_9x16,
    key: process.env.bunny_cdn_video_streaming_key_9x16,
    hostname: 'vz-97606b97-2f3.b-cdn.net'
  }
};

// Select diverse videos for each library
function selectVideosForUpload() {
  const selected = {
    '16x9': [],
    '9x16': []
  };
  
  // Get videos by category and resolution
  const categories = ['venues', 'photographers', 'videographers', 'musicians', 'djs'];
  
  categories.forEach(category => {
    // Get 2 videos per category for each resolution
    const videos16x9 = allVideos.filter(v => v.category === category && v.resolution === '16x9').slice(0, 2);
    const videos9x16 = allVideos.filter(v => v.category === category && v.resolution === '9x16').slice(0, 2);
    
    selected['16x9'].push(...videos16x9);
    selected['9x16'].push(...videos9x16);
  });
  
  return selected;
}

async function createVideoWithMetadata(libraryId, apiKey, videoData) {
  try {
    const createUrl = `https://video.bunnycdn.com/library/${libraryId}/videos`;
    
    // Create video with title first
    const createPayload = {
      title: videoData.title
    };
    
    console.log(`  📝 Creating video: "${videoData.title}"`);
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.log(`  ❌ Failed to create video: ${createResponse.status} - ${error}`);
      return null;
    }
    
    const createdVideo = await createResponse.json();
    console.log(`  ✅ Created video: ${createdVideo.guid}`);
    
    // Now update with metadata
    const updateUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${createdVideo.guid}`;
    const metadataPayload = {
      metaTags: {
        category: videoData.category,
        vendorName: videoData.vendor,
        vendorWebsite: `www.${videoData.vendor.toLowerCase().replace(/\s+/g, '')}.com`,
        vendorCity: videoData.city,
        vendorState: videoData.state,
        vendorZipcode: videoData.zipcode,
        description: videoData.description
      }
    };
    
    console.log(`  🏷️  Adding metadata:`, JSON.stringify(metadataPayload.metaTags, null, 2));
    
    // Try POST method for metadata update
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadataPayload)
    });
    
    if (updateResponse.ok) {
      console.log(`  ✅ Metadata added successfully`);
    } else {
      console.log(`  ⚠️  Metadata update returned: ${updateResponse.status}`);
      // Continue anyway - video was created
    }
    
    return createdVideo.guid;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function uploadVideoFile(libraryId, apiKey, videoId, filePath) {
  try {
    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`  📤 Uploading ${Math.round(fileSize / 1024 / 1024)}MB file...`);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'video/mp4',
        'Content-Length': fileSize
      },
      body: fileStream,
      duplex: 'half'
    });
    
    if (uploadResponse.ok) {
      console.log(`  ✅ Upload successful!`);
      return true;
    } else {
      const error = await uploadResponse.text();
      console.log(`  ❌ Upload failed: ${uploadResponse.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Upload error: ${error.message}`);
    return false;
  }
}

async function verifyMetadata(libraryId, apiKey, videoId) {
  try {
    const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    const response = await fetch(url, {
      headers: {
        'AccessKey': apiKey,
        'accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const video = await response.json();
      const hasMeta = video.metaTags && Object.keys(video.metaTags).length > 0;
      
      if (hasMeta) {
        console.log(`  ✅ Metadata verified:`, JSON.stringify(video.metaTags, null, 2));
      } else {
        console.log(`  ⚠️  No metadata found on video!`);
      }
      
      return hasMeta;
    }
    
    return false;
  } catch (error) {
    console.log(`  ❌ Verification error: ${error.message}`);
    return false;
  }
}

async function uploadToMainLibraries() {
  console.log('🎬 Uploading Videos to Main Bunny CDN Libraries\n');
  console.log('=' .repeat(60) + '\n');
  
  const selectedVideos = selectVideosForUpload();
  
  console.log('📊 Videos selected for upload:');
  console.log(`   16x9: ${selectedVideos['16x9'].length} videos`);
  console.log(`   9x16: ${selectedVideos['9x16'].length} videos`);
  console.log('');
  
  let totalUploaded = 0;
  let totalWithMetadata = 0;
  let totalFailed = 0;
  
  // Process each library
  for (const [resolution, library] of Object.entries(MAIN_LIBRARIES)) {
    const videos = selectedVideos[resolution];
    
    if (!library.id || !library.key) {
      console.log(`\n⚠️  Skipping ${resolution} - library not configured`);
      continue;
    }
    
    console.log(`\n📁 Processing ${resolution} Library (ID: ${library.id}):`);
    console.log('-'.repeat(50));
    
    for (const video of videos) {
      const fullPath = path.join('/app/main', video.path);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.log(`\n❌ File not found: ${video.path}`);
        totalFailed++;
        continue;
      }
      
      console.log(`\n🎥 ${video.category.toUpperCase()} - ${video.title}:`);
      
      // Create video with metadata
      const videoId = await createVideoWithMetadata(library.id, library.key, video);
      
      if (videoId) {
        // Upload the actual file
        const uploaded = await uploadVideoFile(library.id, library.key, videoId, fullPath);
        
        if (uploaded) {
          totalUploaded++;
          
          // Verify metadata was saved
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for processing
          const hasMetadata = await verifyMetadata(library.id, library.key, videoId);
          
          if (hasMetadata) {
            totalWithMetadata++;
          }
          
          // Show the CDN URL
          const cdnUrl = `https://${library.hostname}/${videoId}/playlist.m3u8`;
          console.log(`  🔗 CDN URL: ${cdnUrl}`);
        } else {
          totalFailed++;
        }
      } else {
        totalFailed++;
      }
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 UPLOAD SUMMARY:');
  console.log(`✅ Successfully uploaded: ${totalUploaded}`);
  console.log(`🏷️  Videos with metadata: ${totalWithMetadata}`);
  console.log(`❌ Failed: ${totalFailed}`);
  
  if (totalWithMetadata < totalUploaded) {
    console.log('\n⚠️  WARNING: Some videos may not have metadata!');
    console.log('The category display bug may still occur.');
  } else if (totalUploaded > 0) {
    console.log('\n✨ All videos uploaded with metadata!');
    console.log('Categories should now display correctly (not sequentially).');
    console.log('\n🔍 Test at: https://media.synthetikmedia.ai');
  }
}

// Run the upload
uploadToMainLibraries().catch(console.error);