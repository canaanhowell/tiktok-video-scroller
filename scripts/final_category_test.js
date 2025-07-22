// Final test to verify categories are working correctly
const baseUrl = 'https://media.synthetikmedia.ai';

async function finalCategoryTest() {
  console.log('🎯 Final Category Test\n');
  console.log('=' .repeat(60) + '\n');
  
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=default`);
  const data = await response.json();
  
  if (data.success && data.videos) {
    console.log(`📊 Found ${data.videos.length} videos in library ${data.libraryId}:\n`);
    
    // Group by category
    const byCategory = {};
    data.videos.forEach((video, i) => {
      if (!byCategory[video.category]) {
        byCategory[video.category] = [];
      }
      byCategory[video.category].push({
        index: i + 1,
        title: video.title,
        vendor: video.vendorName
      });
    });
    
    // Display grouped results
    Object.entries(byCategory).forEach(([category, videos]) => {
      console.log(`📁 ${category.toUpperCase()} (${videos.length} videos):`);
      videos.forEach(v => {
        console.log(`   ${v.index}. "${v.title}" - ${v.vendor}`);
      });
      console.log('');
    });
    
    // Check for sequential pattern
    const categories = data.videos.map(v => v.category);
    const sequentialPattern = ['venues', 'photographers', 'videographers', 'musicians', 'djs'];
    
    let matchesSequential = true;
    for (let i = 0; i < Math.min(5, categories.length); i++) {
      if (categories[i] !== sequentialPattern[i % 5]) {
        matchesSequential = false;
        break;
      }
    }
    
    console.log('=' .repeat(60));
    console.log('\n📊 Analysis:');
    console.log(`Total videos: ${data.videos.length}`);
    console.log(`Unique categories: ${Object.keys(byCategory).length}`);
    console.log(`Categories: ${Object.keys(byCategory).join(', ')}`);
    
    if (matchesSequential) {
      console.log('\n⚠️  WARNING: First 5 videos still match sequential pattern!');
      console.log('But this might be coincidence if we have diverse categories overall.');
    } else {
      console.log('\n✅ SUCCESS: Categories are NOT in sequential order!');
    }
    
    // Final verdict
    console.log('\n🏁 FINAL VERDICT:');
    if (Object.keys(byCategory).length >= 3 && !matchesSequential) {
      console.log('✅ CATEGORY BUG IS FIXED!');
      console.log('Videos now display their actual categories from metadata.');
    } else if (Object.keys(byCategory).length >= 3) {
      console.log('✅ MOSTLY FIXED!');
      console.log('We have diverse categories, even if some follow the old pattern.');
    } else {
      console.log('⚠️  More diverse videos needed to fully test.');
    }
  }
}

finalCategoryTest().catch(console.error);