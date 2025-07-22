// Upload more diverse videos with proper metadata
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9,
  hostname: 'vz-97606b97-31d.b-cdn.net'
};

// Sample videos to create (we'll use existing files)
const videosToCreate = [
  {
    title: 'Sunset Photography Wedding Showcase',
    category: 'photographers',
    vendorName: 'Sunset Photography Studios',
    vendorWebsite: 'www.sunsetphotostudios.com',
    vendorCity: 'Franklin',
    vendorState: 'Tennessee',
    vendorZipcode: '37064'
  },
  {
    title: 'DJ Spectacular Party Mix',
    category: 'djs',
    vendorName: 'DJ Spectacular Events',
    vendorWebsite: 'www.djspectacular.com',
    vendorCity: 'Memphis',
    vendorState: 'Tennessee',
    vendorZipcode: '38103'
  },
  {
    title: 'Royal Gardens Venue Tour',
    category: 'venues',
    vendorName: 'Royal Gardens Estate',
    vendorWebsite: 'www.royalgardens.com',
    vendorCity: 'Brentwood',
    vendorState: 'Tennessee',
    vendorZipcode: '37027'
  },
  {
    title: 'Forever Films Cinematic Reel',
    category: 'videographers',
    vendorName: 'Forever Films Productions',
    vendorWebsite: 'www.foreverfilms.com',
    vendorCity: 'Chattanooga',
    vendorState: 'Tennessee',
    vendorZipcode: '37402'
  }
];

async function createVideoWithMetadata(videoData) {
  console.log(`\n📹 Creating: ${videoData.title}`);
  
  // Create video
  const createResponse = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos`,
    {
      method: 'POST',
      headers: {
        'AccessKey': LIBRARY.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: videoData.title })
    }
  );
  
  if (!createResponse.ok) {
    console.log('   ❌ Failed to create video');
    return null;
  }
  
  const created = await createResponse.json();
  console.log(`   ✅ Created: ${created.guid}`);
  
  // Add metadata using moments
  const moments = [
    { label: `category:${videoData.category}`, timestamp: 0 },
    { label: `vendorName:${videoData.vendorName}`, timestamp: 0 },
    { label: `vendorWebsite:${videoData.vendorWebsite}`, timestamp: 0 },
    { label: `vendorCity:${videoData.vendorCity}`, timestamp: 0 },
    { label: `vendorState:${videoData.vendorState}`, timestamp: 0 },
    { label: `vendorZipcode:${videoData.vendorZipcode}`, timestamp: 0 }
  ];
  
  const updateResponse = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${created.guid}`,
    {
      method: 'POST',
      headers: {
        'AccessKey': LIBRARY.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moments })
    }
  );
  
  if (updateResponse.ok) {
    console.log('   ✅ Metadata added');
    console.log(`   🌐 URL: https://${LIBRARY.hostname}/${created.guid}/playlist.m3u8`);
    return created.guid;
  }
  
  return null;
}

async function uploadSampleFile(videoId) {
  // Use the first available MP4 file as sample content
  const sampleFiles = [
    '/app/main/staging_app/input/musicians/Gen-4 slowmotion playing the cello 190716958.mp4',
    '/app/main/staging_app/input/output/ceremonies/1.mp4'
  ];
  
  let filePath = null;
  for (const file of sampleFiles) {
    if (fs.existsSync(file)) {
      filePath = file;
      break;
    }
  }
  
  if (!filePath) {
    console.log('   ⚠️  No sample file found for upload');
    return false;
  }
  
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;
  
  console.log(`   📤 Uploading sample content (${Math.round(fileSize / 1024 / 1024)}MB)`);
  
  const uploadResponse = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${videoId}`,
    {
      method: 'PUT',
      headers: {
        'AccessKey': LIBRARY.key,
        'Content-Type': 'video/mp4',
        'Content-Length': fileSize
      },
      body: fileStream,
      duplex: 'half'
    }
  );
  
  if (uploadResponse.ok) {
    console.log('   ✅ Content uploaded');
    return true;
  }
  
  console.log('   ❌ Upload failed');
  return false;
}

async function uploadDiverseVideos() {
  console.log('🎬 Uploading Diverse Videos to Test Category Fix\n');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  
  for (const videoData of videosToCreate) {
    const videoId = await createVideoWithMetadata(videoData);
    if (videoId) {
      const uploaded = await uploadSampleFile(videoId);
      if (uploaded) {
        successCount++;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`\n✅ Successfully uploaded ${successCount}/${videosToCreate.length} videos`);
  
  if (successCount > 0) {
    console.log('\n🎉 Category display should now show:');
    console.log('- venues (2 videos)');
    console.log('- musicians (2 videos)');
    console.log('- photographers (1 video)');
    console.log('- videographers (1 video)');
    console.log('- djs (1 video)');
    console.log('\n🔍 Test at https://media.synthetikmedia.ai');
    console.log('Categories should display based on actual content, not sequentially!');
  }
}

uploadDiverseVideos().catch(console.error);