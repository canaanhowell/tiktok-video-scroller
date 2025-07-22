// Compare what homepage sees vs direct API calls
const baseUrl = 'https://media.synthetikmedia.ai';

async function compareHomepageVsAPI() {
  console.log('🔍 Comparing homepage vs direct API calls...\n');
  
  try {
    // Test 1: Direct API call (what I've been testing)
    console.log('1️⃣ Direct API call:');
    const directResponse = await fetch(`${baseUrl}/api/bunny-videos?device=mobile`);
    const directData = await directResponse.json();
    
    console.log(`   Status: ${directResponse.status}`);
    console.log(`   Success: ${directData.success}`);
    console.log(`   Videos: ${directData.videos?.length || 0}`);
    if (directData.videos?.length > 0) {
      console.log(`   First video category: ${directData.videos[0].category}`);
      console.log(`   First video title: ${directData.videos[0].title || 'undefined'}`);
    }
    console.log('');
    
    // Test 2: Simulate homepage call (no device param initially)
    console.log('2️⃣ Homepage-style API call (no device):');
    const homepageResponse = await fetch(`${baseUrl}/api/bunny-videos`);
    const homepageData = await homepageResponse.json();
    
    console.log(`   Status: ${homepageResponse.status}`);
    console.log(`   Success: ${homepageData.success}`);
    console.log(`   Videos: ${homepageData.videos?.length || 0}`);
    if (homepageData.videos?.length > 0) {
      console.log(`   First video category: ${homepageData.videos[0].category}`);
      console.log(`   First video title: ${homepageData.videos[0].title || 'undefined'}`);
    }
    console.log('');
    
    // Test 3: Different device types
    const deviceTypes = ['desktop', 'tablet'];
    for (const deviceType of deviceTypes) {
      console.log(`3️⃣ API call with device=${deviceType}:`);
      const deviceResponse = await fetch(`${baseUrl}/api/bunny-videos?device=${deviceType}`);
      const deviceData = await deviceResponse.json();
      
      console.log(`   Status: ${deviceResponse.status}`);
      console.log(`   Success: ${deviceData.success}`);
      console.log(`   Videos: ${deviceData.videos?.length || 0}`);
      console.log(`   Library: ${deviceData.libraryId}`);
      if (deviceData.videos?.length > 0) {
        console.log(`   Sample categories: ${deviceData.videos.slice(0, 3).map(v => v.category).join(', ')}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

compareHomepageVsAPI();