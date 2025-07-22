// Test the current Popular tab API to see if our fix is deployed
const baseUrl = 'https://media.synthetikmedia.ai';

async function testCurrentPopular() {
  console.log('🔥 Testing current Popular tab after deployment...\n');
  
  // Test what the popular tab is returning now
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=mobile&category=popular`);
  const data = await response.json();
  
  console.log('📊 Current Popular tab API response:');
  console.log(`URL: /api/bunny-videos?device=mobile&category=popular`);
  console.log(`Success: ${data.success}`);
  console.log(`Library: ${data.libraryId}`);
  console.log(`Category param: ${data.category}`);
  console.log(`Videos: ${data.videos?.length || 0}`);
  console.log('');
  
  if (data.videos && data.videos.length > 0) {
    console.log('🎯 First 3 videos and their categories:');
    data.videos.slice(0, 3).forEach((video, i) => {
      console.log(`${i+1}. @${video.username}`);
      console.log(`   Title: "${video.title}"`);
      console.log(`   Vendor: "${video.vendorName}"`);
      console.log(`   Category: "${video.category}" ← Should be specific category, not "general"`);
      console.log('');
    });
    
    // Check if categories are working
    const categories = data.videos.map(v => v.category);
    const uniqueCategories = [...new Set(categories)];
    console.log('📋 All categories found:', uniqueCategories.join(', '));
    
    const generalCount = categories.filter(c => c === 'general').length;
    const specificCount = categories.length - generalCount;
    
    console.log(`✅ Specific categories: ${specificCount}/${categories.length}`);
    console.log(`❌ "General" categories: ${generalCount}/${categories.length}`);
    
    if (generalCount === categories.length) {
      console.log('\n🚨 ALL videos still showing as "general" - fix not working yet');
    } else if (specificCount > 0) {
      console.log('\n✅ Categories are working! Some videos have specific categories');
    }
  }
}

testCurrentPopular();