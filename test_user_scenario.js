// Test the exact scenario the user is experiencing
const baseUrl = 'https://media.synthetikmedia.ai';

async function testUserScenario() {
  console.log('👤 Testing user scenario - checking all device types...\n');
  
  const deviceTypes = ['mobile', 'desktop', 'tablet', undefined];
  
  for (const deviceType of deviceTypes) {
    const deviceParam = deviceType ? `?device=${deviceType}` : '';
    const url = `${baseUrl}/api/bunny-videos${deviceParam}`;
    
    console.log(`🔍 Testing: ${url}`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.videos) {
        console.log(`  ✅ Success - ${data.videos.length} videos from library ${data.libraryId}`);
        
        // Count categories
        const categoryCounts = {};
        data.videos.forEach(video => {
          categoryCounts[video.category] = (categoryCounts[video.category] || 0) + 1;
        });
        
        console.log('  📊 Category breakdown:');
        Object.entries(categoryCounts).forEach(([cat, count]) => {
          console.log(`    ${cat}: ${count} videos`);
        });
        
        // Show specific problem categories
        const problemCategories = data.videos.filter(v => 
          ['musicians', 'videographers', 'djs'].includes(v.category) && v.category === 'general'
        );
        
        if (problemCategories.length > 0) {
          console.log('  🚨 Problem videos showing as "general":');
          problemCategories.forEach(v => console.log(`    "${v.title}"`));
        }
        
        // Show working categories
        const workingProblemCats = data.videos.filter(v => 
          ['musicians', 'videographers', 'djs'].includes(v.category)
        );
        
        if (workingProblemCats.length > 0) {
          console.log('  ✅ These problem categories are working correctly:');
          workingProblemCats.forEach(v => console.log(`    "${v.title}" -> ${v.category}`));
        }
        
      } else {
        console.log(`  ❌ Failed - ${data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testUserScenario();