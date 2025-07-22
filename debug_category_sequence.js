// Debug script to check if there's a pattern in category display
const baseUrl = 'https://media.synthetikmedia.ai';

async function debugCategorySequence() {
  console.log('🔍 Debugging Category Sequence Issue\n');
  console.log('User reports: Categories display in sequence (venues → photographers → videographers → musicians → djs)');
  console.log('regardless of actual video data.\n');
  
  // Check Popular tab
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=popular`);
  const data = await response.json();
  
  if (data.videos) {
    console.log('📊 API sends these categories in order:');
    data.videos.forEach((video, i) => {
      console.log(`Video ${i+1}: @${video.username} → "${video.category}"`);
    });
    
    console.log('\n🤔 If UI shows different sequence, possible causes:');
    console.log('1. CSS animation or transition cycling through categories');
    console.log('2. JavaScript timer changing categories periodically');
    console.log('3. State management issue overriding video.category');
    console.log('4. Rendering bug where wrong video data is displayed');
    console.log('5. Index-based category assignment somewhere');
    
    // Check for patterns
    console.log('\n📈 Checking for patterns:');
    const sequence = ['venues', 'photographers', 'videographers', 'musicians', 'djs'];
    let matchesSequence = true;
    
    for (let i = 0; i < Math.min(5, data.videos.length); i++) {
      const expectedCategory = sequence[i % sequence.length];
      const actualCategory = data.videos[i].category;
      console.log(`Position ${i+1}: Expected "${expectedCategory}", Got "${actualCategory}" - ${expectedCategory === actualCategory ? '✅' : '❌'}`);
      if (expectedCategory !== actualCategory) {
        matchesSequence = false;
      }
    }
    
    if (matchesSequence) {
      console.log('\n⚠️ WARNING: API data matches the reported sequence!');
      console.log('This suggests the issue might be in the API or data source.');
    } else {
      console.log('\n✅ API data does NOT match the sequence.');
      console.log('This confirms the issue is in the frontend rendering.');
    }
    
    // Analyze actual categories
    console.log('\n📊 Actual category distribution:');
    const categoryCounts = {};
    data.videos.forEach(v => {
      categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
    });
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} videos`);
    });
  }
}

debugCategorySequence();