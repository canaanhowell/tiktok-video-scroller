// Check what's happening with the frontend data flow
const baseUrl = 'https://media.synthetikmedia.ai';

async function checkFrontendFlow() {
  console.log('🔍 Checking frontend data flow...\n');
  
  // Check Popular tab API response
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=popular`);
  const data = await response.json();
  
  console.log('📊 API Response Summary:');
  console.log(`Success: ${data.success}`);
  console.log(`Videos: ${data.videos?.length || 0}`);
  console.log(`Category param: ${data.category}`);
  console.log(`Library: ${data.libraryId}`);
  console.log('');
  
  if (data.videos) {
    console.log('🎯 Video Categories from API:');
    data.videos.forEach((video, i) => {
      console.log(`${i+1}. @${video.username} → category: "${video.category}"`);
    });
    
    console.log('\n❓ If frontend shows different categories, then:');
    console.log('1. Frontend is using cached/old data');
    console.log('2. Frontend is overriding the category field');
    console.log('3. There\'s a data transformation bug');
    
    console.log('\n🔍 Check browser console for:');
    console.log('- [Popular] All video categories: [array]');
    console.log('- [VideoItem] Video X category specifically: "value"');
    console.log('\nThese should match the API categories above!');
  }
}

checkFrontendFlow();