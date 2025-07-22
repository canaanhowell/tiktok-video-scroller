#!/usr/bin/env node
// Check video encoding status
require('dotenv').config({ path: '/app/main/web_app/.env' });

async function checkVideoStatus() {
  console.log('🎬 Checking 9x16 Video Status\n');
  console.log('=' .repeat(60) + '\n');
  
  const response = await fetch(
    `https://video.bunnycdn.com/library/${process.env.bunny_cdn_video_streaming_library_9x16}/videos?page=1&itemsPerPage=100&orderBy=date`,
    {
      headers: {
        'AccessKey': process.env.bunny_cdn_video_streaming_key_9x16,
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
  
  console.log(`📊 Total videos: ${videos.length}\n`);
  
  // Check status of each video
  let processing = 0;
  let ready = 0;
  let failed = 0;
  
  videos.forEach((video, i) => {
    const isReady = video.status === 2 || video.status === 3 || video.status === 4;
    const isFailed = video.status === 5;
    const isProcessing = video.status === 1;
    
    if (isProcessing) processing++;
    else if (isReady) ready++;
    else if (isFailed) failed++;
    
    console.log(`${i+1}. ${video.title}`);
    console.log(`   Status: ${video.status} (${isReady ? '✅ Ready' : isProcessing ? '⏳ Processing' : isFailed ? '❌ Failed' : '❓ Unknown'})`);
    console.log(`   Encode Progress: ${video.encodeProgress}%`);
    console.log(`   Available Resolutions: ${JSON.stringify(video.availableResolutions || [])}`);
    console.log(`   Thumbnails: ${video.thumbnailCount || 0}`);
    console.log(`   Created: ${new Date(video.dateUploaded).toLocaleString()}`);
    
    // Show metadata
    if (video.moments?.length > 0) {
      const metadata = {};
      video.moments.forEach(m => {
        if (m.label?.includes(':')) {
          const [key, value] = m.label.split(':');
          metadata[key] = value;
        }
      });
      console.log(`   Metadata: category=${metadata.category}, vendor=${metadata.vendorName}`);
    }
    console.log('');
  });
  
  console.log('=' .repeat(60));
  console.log('\n📊 Summary:');
  console.log(`✅ Ready: ${ready}`);
  console.log(`⏳ Processing: ${processing}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Total: ${videos.length}`);
  
  if (processing > 0) {
    console.log('\n⚠️  Some videos are still processing!');
    console.log('This might cause the colorful loading screen.');
    console.log('Wait a few minutes for encoding to complete.');
  }
  
  if (ready === videos.length) {
    console.log('\n✅ All videos are ready!');
    console.log('The colorful screen might be a different issue.');
    console.log('\nTry:');
    console.log('1. Clear browser cache');
    console.log('2. Check browser console for errors');
    console.log('3. Try a different browser or incognito mode');
  }
}

checkVideoStatus().catch(console.error);