// Test what happens when we request category=popular
const baseUrl = 'https://media.synthetikmedia.ai';

async function testPopularParam() {
  console.log('🔥 Testing category=popular parameter...\n');
  
  // Test the exact URL the Popular tab uses
  const response = await fetch(`${baseUrl}/api/bunny-videos?category=popular`);
  const data = await response.json();
  
  console.log('API Response:');
  console.log(`URL: /api/bunny-videos?category=popular`);
  console.log(`Success: ${data.success}`);
  console.log(`Videos: ${data.videos?.length || 0}`);
  console.log(`Library: ${data.libraryId}`);
  console.log(`Category returned: ${data.category}`);
  console.log(`Device type: ${data.deviceType}`);
  console.log('');
  
  if (data.videos && data.videos.length > 0) {
    console.log('📊 First few videos and their categories:');
    data.videos.slice(0, 3).forEach((video, i) => {
      console.log(`${i+1}. "${video.vendorName}"`);
      console.log(`   Category: "${video.category}"`);
      console.log(`   Title: "${video.title}"`);
    });
  }
  
  console.log('\n🔍 What should happen:');
  console.log('- category=popular should NOT be treated as a vendor category');
  console.log('- Should fall back to default library and detect categories');
  console.log('- Each video should get its own detected category based on vendor name');
}

testPopularParam();