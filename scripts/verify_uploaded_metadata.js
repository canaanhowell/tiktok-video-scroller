// Verify metadata on recently uploaded videos
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

async function checkLibraryVideos(name, config) {
  console.log(`\n📁 ${name} Library (ID: ${config.id}):`);
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${config.id}/videos?page=1&itemsPerPage=10&orderBy=date`,
      {
        headers: {
          'AccessKey': config.key,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`❌ Error: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    const videos = data.items || [];
    
    console.log(`Found ${videos.length} videos\n`);
    
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   GUID: ${video.guid}`);
      console.log(`   Status: ${video.status === 4 ? '✅ Ready' : '⏳ Processing'}`);
      console.log(`   MetaTags:`, video.metaTags);
      
      if (video.metaTags && Object.keys(video.metaTags).length > 0) {
        console.log(`   ✅ HAS METADATA!`);
        Object.entries(video.metaTags).forEach(([key, value]) => {
          console.log(`      ${key}: "${value}"`);
        });
      } else {
        console.log(`   ❌ NO METADATA!`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function verifyMetadata() {
  console.log('🔍 Verifying Metadata on Uploaded Videos\n');
  console.log('=' .repeat(60));
  
  for (const [name, config] of Object.entries(MAIN_LIBRARIES)) {
    await checkLibraryVideos(name, config);
  }
  
  console.log('=' .repeat(60));
  console.log('\n💡 Note: If videos show "NO METADATA", the metaTags update failed.');
  console.log('This means the category sequential bug will still occur.');
}

verifyMetadata().catch(console.error);