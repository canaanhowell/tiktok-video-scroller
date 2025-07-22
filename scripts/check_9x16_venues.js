#!/usr/bin/env node
// Check what's in the 9x16 venues library
require('dotenv').config({ path: '/app/main/web_app/.env' });

async function check9x16Venues() {
  console.log('🔍 Checking 9x16 Venues Library\n');
  console.log('=' .repeat(60) + '\n');
  
  const LIBRARY = {
    id: process.env.bunny_cdn_video_streaming_library_venues_9x16,
    key: process.env.bunny_cdn_video_streaming_key_venues_9x16
  };
  
  console.log(`Library ID: ${LIBRARY.id}\n`);
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos?page=1&itemsPerPage=100&orderBy=date`,
      {
        headers: {
          'AccessKey': LIBRARY.key,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`❌ Failed to fetch videos: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log(`📊 Total videos in library: ${data.totalItems || 0}\n`);
    
    if (data.items && data.items.length > 0) {
      data.items.forEach((video, i) => {
        console.log(`${i+1}. ${video.title}`);
        console.log(`   GUID: ${video.guid}`);
        console.log(`   Status: ${video.status}`);
        console.log(`   Storage Size: ${video.storageSize} bytes`);
        console.log(`   Length: ${video.length} seconds`);
        console.log(`   Width: ${video.width}`);
        console.log(`   Height: ${video.height}`);
        console.log(`   Created: ${new Date(video.dateUploaded).toLocaleString()}`);
        console.log(`   Thumbnail Count: ${video.thumbnailCount}`);
        console.log(`   Has MP4: ${video.hasMP4Fallback}`);
        console.log(`   Available Resolutions: ${video.availableResolutions}`);
        console.log(`   Encode Progress: ${video.encodeProgress}%`);
        
        // Check if this is a test pattern video
        if (video.width === 1920 && video.height === 1080 && video.length < 30) {
          console.log(`   ⚠️  This might be a test pattern video!`);
        }
        
        // Check moments for metadata
        if (video.moments && video.moments.length > 0) {
          console.log(`   Moments: ${video.moments.length}`);
          video.moments.forEach(m => {
            if (m.label) console.log(`     - ${m.label}`);
          });
        }
        
        console.log('');
      });
    } else {
      console.log('No videos found in this library.');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('=' .repeat(60));
  console.log('\n💡 If you see a test pattern video:');
  console.log('1. The original upload failed');
  console.log('2. Bunny replaced it with a test pattern');
  console.log('3. The title was preserved from the failed upload');
  console.log('4. You need to re-upload the actual video file');
}

check9x16Venues().catch(console.error);