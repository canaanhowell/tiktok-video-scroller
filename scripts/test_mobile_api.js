#!/usr/bin/env node
// Test mobile API response
require('dotenv').config({ path: '/app/main/web_app/.env' });

async function testMobileAPI() {
  console.log('🔍 Testing Mobile API Response\n');
  console.log('=' .repeat(60) + '\n');
  
  try {
    // Test the API endpoint
    const response = await fetch('https://media.synthetikmedia.ai/api/bunny-videos?device=mobile&category=default');
    const data = await response.json();
    
    console.log('📡 API Response:');
    console.log(`Success: ${data.success}`);
    console.log(`Library ID: ${data.libraryId}`);
    console.log(`Category: ${data.category}`);
    console.log(`Video Count: ${data.videos?.length || 0}`);
    console.log(`Error: ${data.error || 'none'}`);
    
    if (data.videos && data.videos.length > 0) {
      console.log('\n📹 First 3 Videos:');
      data.videos.slice(0, 3).forEach((video, i) => {
        console.log(`\n${i+1}. ${video.title}`);
        console.log(`   Category: ${video.category}`);
        console.log(`   Vendor: ${video.vendorName}`);
        console.log(`   GUID: ${video.id}`);
      });
    } else {
      console.log('\n⚠️  No videos returned!');
    }
    
    // Check if it's processing
    if (data.videos?.length === 0) {
      console.log('\n🔄 Possible reasons for no videos:');
      console.log('1. Videos are still processing/encoding');
      console.log('2. Wrong library ID in environment variables');
      console.log('3. API filtering issue');
      
      // Let's check the raw Bunny API
      console.log('\n📡 Checking Raw Bunny API...');
      const bunnyResponse = await fetch(
        `https://video.bunnycdn.com/library/${process.env.bunny_cdn_video_streaming_library_9x16}/videos?page=1&itemsPerPage=10&orderBy=date`,
        {
          headers: {
            'AccessKey': process.env.bunny_cdn_video_streaming_key_9x16,
            'accept': 'application/json'
          }
        }
      );
      
      if (bunnyResponse.ok) {
        const bunnyData = await bunnyResponse.json();
        console.log(`\nBunny CDN shows ${bunnyData.totalItems || 0} total videos`);
        console.log(`Current page has ${bunnyData.items?.length || 0} videos`);
        
        if (bunnyData.items?.length > 0) {
          console.log('\n🎬 Video Processing Status:');
          bunnyData.items.slice(0, 3).forEach((video, i) => {
            console.log(`\n${i+1}. ${video.title}`);
            console.log(`   Status: ${video.status}`);
            console.log(`   Available Resolutions: ${JSON.stringify(video.availableResolutions || [])}`);
            console.log(`   Has Thumbnails: ${video.thumbnailCount > 0 ? 'Yes' : 'No'}`);
            console.log(`   Encoded: ${video.encodeProgress}%`);
            
            // Check moments for metadata
            if (video.moments?.length > 0) {
              console.log('   Metadata:');
              video.moments.forEach(m => {
                if (m.label?.includes(':')) {
                  console.log(`     - ${m.label}`);
                }
              });
            }
          });
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
}

testMobileAPI().catch(console.error);