// Test what metaTags are available in Bunny CDN videos
const baseUrl = 'https://media.synthetikmedia.ai';

async function testMetaTags() {
  console.log('🏷️ Testing metaTags in Bunny CDN videos...\n');
  
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=mobile`);
  const data = await response.json();
  
  if (data.success && data.videos) {
    console.log(`Found ${data.videos.length} videos. Checking metaTags:\n`);
    
    data.videos.forEach((video, i) => {
      console.log(`${i+1}. Raw title: "${video.title}"`);
      console.log(`   Category: ${video.category}`);
      console.log(`   MetaTags:`, video.metaTags);
      console.log('');
    });
  }
}

testMetaTags();