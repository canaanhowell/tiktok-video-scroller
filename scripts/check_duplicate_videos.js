// Check if videos are duplicates
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

async function checkDuplicateVideos() {
  console.log('🔍 Checking for Duplicate Videos\n');
  console.log('=' .repeat(60) + '\n');
  
  // Get all videos from Bunny
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
    console.log('❌ Failed to fetch videos');
    return;
  }
  
  const data = await response.json();
  const videos = data.items || [];
  
  console.log(`📊 Found ${videos.length} videos in library\n`);
  
  // Group by file size and length to detect duplicates
  const videosBySize = {};
  
  videos.forEach((video, index) => {
    const key = `${video.storageSize}_${video.length}`;
    if (!videosBySize[key]) {
      videosBySize[key] = [];
    }
    
    // Parse metadata from moments
    let metadata = {};
    if (video.moments && Array.isArray(video.moments)) {
      video.moments.forEach(moment => {
        if (moment.label && moment.label.includes(':')) {
          const [k, ...v] = moment.label.split(':');
          metadata[k] = v.join(':');
        }
      });
    }
    
    videosBySize[key].push({
      index: index + 1,
      guid: video.guid,
      title: video.title,
      size: video.storageSize,
      length: video.length,
      metadata,
      uploadDate: video.dateUploaded
    });
  });
  
  // Show potential duplicates
  console.log('🔍 Checking for videos with same size/length:\n');
  
  Object.entries(videosBySize).forEach(([key, group]) => {
    if (group.length > 1) {
      console.log(`⚠️  POTENTIAL DUPLICATES (${group.length} videos with size/length: ${key}):`);
      group.forEach(v => {
        console.log(`   ${v.index}. "${v.title}"`);
        console.log(`      GUID: ${v.guid}`);
        console.log(`      Category: ${v.metadata.category || 'none'}`);
        console.log(`      Vendor: ${v.metadata.vendorName || 'none'}`);
        console.log(`      Uploaded: ${v.uploadDate}`);
      });
      console.log('');
    }
  });
  
  // Check what's in the API response
  console.log('\n📡 Checking API response for first 3 videos:');
  const apiResponse = await fetch('https://media.synthetikmedia.ai/api/bunny-videos?device=desktop&category=default');
  const apiData = await apiResponse.json();
  
  if (apiData.videos) {
    apiData.videos.slice(0, 3).forEach((video, i) => {
      console.log(`\n${i+1}. API Video:`);
      console.log(`   Title: "${video.title}"`);
      console.log(`   Category: "${video.category}"`);
      console.log(`   Vendor: "${video.vendorName}"`);
      console.log(`   Source URL: ${video.src}`);
      
      // Extract GUID from URL
      const guidMatch = video.src.match(/\/([a-f0-9-]+)\/playlist\.m3u8/);
      if (guidMatch) {
        console.log(`   GUID: ${guidMatch[1]}`);
      }
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n💡 Analysis:');
  console.log('If the first 3 videos have the same GUID but different categories,');
  console.log('then the API is incorrectly returning the same video multiple times.');
}

checkDuplicateVideos().catch(console.error);