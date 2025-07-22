// Test mixed category detection for Popular/Saved tabs
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function testCategoryLogic() {
  console.log('🧪 Testing category logic for different scenarios...\n');
  
  const testCases = [
    {
      scenario: 'Specific vendor category request',
      requestedCategory: 'videographers',
      vendorName: 'Elegant Events Co',
      description: 'Elegant Events Co - Making your special day unforgettable 💕',
      expectedCategory: 'videographers',
      expectedReason: 'Trust library category'
    },
    {
      scenario: 'Popular tab (mixed categories)',
      requestedCategory: 'popular',
      vendorName: 'The Music Masters', 
      description: 'The Music Masters - Creating magical memories 🎊',
      expectedCategory: 'musicians',
      expectedReason: 'Detect from vendor name'
    },
    {
      scenario: 'Saved tab (mixed categories)',
      requestedCategory: 'saved',
      vendorName: 'Cinematic Weddings',
      description: 'Cinematic Weddings - Your dream wedding starts here ✨',
      expectedCategory: 'videographers', 
      expectedReason: 'Detect from vendor name'
    },
    {
      scenario: 'Default tab (mixed categories)',
      requestedCategory: 'default',
      vendorName: 'DJ Spectacular',
      description: 'DJ Spectacular - Love stories beautifully told 💍',
      expectedCategory: 'djs',
      expectedReason: 'Detect from vendor name'
    }
  ];
  
  testCases.forEach((testCase, i) => {
    console.log(`${i+1}. ${testCase.scenario}`);
    console.log(`   Requested: ${testCase.requestedCategory}`);
    console.log(`   Vendor: ${testCase.vendorName}`);
    
    // Apply the new logic
    const isVendorCategory = ['photographers', 'venues', 'videographers', 'musicians', 'djs', 'florists', 'wedding-cakes', 'bands'].includes(testCase.requestedCategory || '');
    let category = 'general';
    
    if (isVendorCategory) {
      // Trust the library category
      category = testCase.requestedCategory;
    } else {
      // Detect from content
      const searchText = `${testCase.vendorName} ${testCase.description}`.toLowerCase();
      for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
        if (keywords.some(keyword => searchText.includes(keyword))) {
          category = cat;
          break;
        }
      }
    }
    
    const isCorrect = category === testCase.expectedCategory;
    console.log(`   Result: ${category} ${isCorrect ? '✅' : '❌'}`);
    console.log(`   Expected: ${testCase.expectedCategory} (${testCase.expectedReason})`);
    console.log('');
  });
}

testCategoryLogic();