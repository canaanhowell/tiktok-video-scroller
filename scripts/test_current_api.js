// Test if the API now returns correct categories from moments
const baseUrl = 'https://media.synthetikmedia.ai';

async function testCurrentAPI() {
  console.log('🧪 Testing Current API Response\n');
  console.log('=' .repeat(60) + '\n');
  
  // Test the main library (where we added metadata)
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=default`);
  const data = await response.json();
  
  if (data.success && data.videos) {
    console.log(`📊 API Response from library ${data.libraryId}:`);
    console.log(`Found ${data.videos.length} videos\n`);
    
    data.videos.forEach((video, i) => {
      console.log(`${i+1}. ${video.title || video.username}`);
      console.log(`   Category: "${video.category}"`);
      console.log(`   Vendor: ${video.vendorName}`);
      console.log(`   Location: ${video.vendorCity}, ${video.vendorState}`);
      console.log('');
    });
    
    // Check if categories are still sequential
    const categories = data.videos.map(v => v.category);
    const sequentialPattern = ['venues', 'photographers', 'videographers', 'musicians', 'djs'];
    
    let isSequential = true;
    for (let i = 0; i < Math.min(5, categories.length); i++) {
      if (categories[i] !== sequentialPattern[i % 5]) {
        isSequential = false;
        break;
      }
    }
    
    console.log('=' .repeat(60));
    
    if (isSequential) {
      console.log('\n❌ Categories are STILL SEQUENTIAL!');
      console.log('The API is not reading the moments metadata yet.');
      console.log('\n💡 Next steps:');
      console.log('1. Check if the deployment succeeded');
      console.log('2. Verify the API code includes moments parsing');
      console.log('3. Check Vercel logs for any errors');
    } else {
      console.log('\n✅ SUCCESS! Categories are NO LONGER sequential!');
      console.log('The moments metadata is being used correctly.');
      
      // Show actual categories
      const uniqueCategories = [...new Set(categories)];
      console.log('\nCategories found:', uniqueCategories.join(', '));
    }
  }
}

testCurrentAPI().catch(console.error);