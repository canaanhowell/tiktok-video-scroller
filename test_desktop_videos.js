// Test desktop library videos specifically
const baseUrl = 'https://media.synthetikmedia.ai';

async function testDesktopVideos() {
  console.log('🖥️ Testing desktop library videos...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop`);
    const data = await response.json();
    
    console.log(`Library ID: ${data.libraryId}`);
    console.log(`Total videos: ${data.videos?.length || 0}\n`);
    
    if (data.videos?.length > 0) {
      console.log('📋 All desktop videos:');
      data.videos.forEach((video, i) => {
        console.log(`${i+1}. "${video.title}"`);
        console.log(`   Category: ${video.category}`);
        console.log(`   Vendor: ${video.vendorName}`);
        console.log(`   Description: ${video.description}`);
        console.log('');
      });
      
      // Check if any show as "general"
      const generalVideos = data.videos.filter(v => v.category === 'general');
      const workingVideos = data.videos.filter(v => v.category !== 'general');
      
      console.log('📊 SUMMARY:');
      console.log(`Working categories: ${workingVideos.length} videos`);
      console.log(`"General" categories: ${generalVideos.length} videos`);
      
      if (generalVideos.length > 0) {
        console.log('\n🚨 Videos showing as "general":');
        generalVideos.forEach((video, i) => {
          console.log(`${i+1}. "${video.title}" (should be categorized)`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDesktopVideos();