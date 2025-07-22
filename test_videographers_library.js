// Test the videographers library specifically
const baseUrl = 'https://media.synthetikmedia.ai';

async function testVideographersLibrary() {
  console.log('🎬 Testing videographers library specifically...\n');
  
  const url = `${baseUrl}/api/bunny-videos?device=desktop&category=videographers`;
  console.log(`Testing: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.videos) {
      console.log(`\n📊 Found ${data.videos.length} videos:`);
      data.videos.forEach((video, i) => {
        console.log(`${i+1}. "${video.title}"`);
        console.log(`   Category: ${video.category}`);
        console.log(`   Vendor: ${video.vendorName}`);
        console.log(`   Description: ${video.description}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVideographersLibrary();