// Test the vendor name priority fix
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function testVendorPriority() {
  console.log('🔧 Testing vendor name priority fix...\n');
  
  const testCases = [
    {
      vendorName: 'DJ Spectacular',
      description: 'DJ Spectacular - Love stories beautifully told 💍',
      title: 'Golden Hour Photography - Photographers Showcase',
      expectedCategory: 'djs'
    },
    {
      vendorName: 'Royal Venues',
      description: 'Royal Venues - Your perfect day, our passion 💖',
      title: 'Party Masters DJ - Djs Showcase', 
      expectedCategory: 'venues'
    },
    {
      vendorName: 'Captured Dreams',
      description: 'Captured Dreams - Making memories that matter 🎉',
      title: 'DJ Spectacular - Djs Showcase',
      expectedCategory: 'general' // Should be general since "captured dreams" has no specific keywords
    }
  ];
  
  testCases.forEach((testCase, i) => {
    console.log(`${i+1}. Testing: ${testCase.vendorName}`);
    console.log(`   Title: "${testCase.title}"`);
    console.log(`   Description: "${testCase.description}"`);
    
    // NEW LOGIC: Try vendor name + description first
    const vendorText = `${testCase.vendorName} ${testCase.description}`.toLowerCase();
    const titleText = testCase.title.toLowerCase();
    
    console.log(`   Vendor text: "${vendorText}"`);
    
    let category = 'general';
    const categoryOrder = ['videographers', 'photographers', 'musicians', 'djs', 'venues', 'general'];
    
    // First try vendor name + description
    for (const cat of categoryOrder) {
      const keywords = VENDOR_CATEGORIES[cat];
      if (keywords && keywords.some(keyword => vendorText.includes(keyword))) {
        category = cat;
        console.log(`   ✅ Detected from vendor: ${cat}`);
        break;
      }
    }
    
    // If still general, try title as fallback
    if (category === 'general') {
      const searchText = `${titleText} ${vendorText}`.toLowerCase();
      for (const cat of categoryOrder) {
        const keywords = VENDOR_CATEGORIES[cat];
        if (keywords && keywords.some(keyword => searchText.includes(keyword))) {
          category = cat;
          console.log(`   ✅ Detected from title: ${cat}`);
          break;
        }
      }
    }
    
    const isCorrect = category === testCase.expectedCategory;
    console.log(`   Result: ${category} ${isCorrect ? '✅' : '❌'} (expected: ${testCase.expectedCategory})`);
    console.log('');
  });
}

testVendorPriority();