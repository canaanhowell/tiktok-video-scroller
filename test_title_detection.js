// Test category detection using Bunny CDN titles
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function testTitleDetection() {
  console.log('🎯 Testing category detection using Bunny CDN titles...\n');
  
  const testCases = [
    {
      title: 'Love Story Cinema - Videographers Showcase',
      vendorName: 'Elegant Events Co',
      expectedCategory: 'videographers'
    },
    {
      title: 'Forever Films - Videographers Showcase', 
      vendorName: 'Golden Hour Photography',
      expectedCategory: 'videographers'
    },
    {
      title: 'Classical Quartet - Musicians Showcase',
      vendorName: 'The Music Masters',
      expectedCategory: 'musicians'
    },
    {
      title: 'Party Masters DJ - Djs Showcase',
      vendorName: 'DJ Spectacular', 
      expectedCategory: 'djs'
    }
  ];
  
  testCases.forEach((testCase, i) => {
    console.log(`${i+1}. Testing title-based detection:`);
    console.log(`   Title: "${testCase.title}"`);
    console.log(`   Vendor: "${testCase.vendorName}"`);
    
    // New method: Check title first, then vendor name
    const titleText = testCase.title.toLowerCase();
    const vendorText = testCase.vendorName.toLowerCase();
    const searchText = `${titleText} ${vendorText}`.toLowerCase();
    
    let detectedCategory = 'general';
    for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        detectedCategory = cat;
        break;
      }
    }
    
    const isCorrect = detectedCategory === testCase.expectedCategory;
    console.log(`   Detected: ${detectedCategory} ${isCorrect ? '✅' : '❌'}`);
    console.log(`   Expected: ${testCase.expectedCategory}`);
    console.log('');
  });
}

testTitleDetection();