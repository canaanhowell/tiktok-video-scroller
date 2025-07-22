// Test the category detection fix locally
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function testCategoryDetection() {
  console.log('🧪 Testing category detection fix...\n');
  
  // Test cases that were failing before
  const testCases = [
    {
      vendorName: 'The Music Masters',
      description: 'The Music Masters - Creating magical memories 🎊 | Nashville, Tennessee',
      filename: 'photo_16x9_0720_1752979485457.mp4',
      expectedCategory: 'musicians'
    },
    {
      vendorName: 'Cinematic Weddings', 
      description: 'Cinematic Weddings - Your dream wedding starts here ✨ | Nashville, Tennessee',
      filename: 'photo_16x9_0720_1752979528938.mp4',
      expectedCategory: 'videographers'
    },
    {
      vendorName: 'DJ Spectacular',
      description: 'DJ Spectacular - Love stories beautifully told 💍 | Nashville, Tennessee', 
      filename: 'social_u8756272651_bride_and_groom_0.mp4',
      expectedCategory: 'djs'
    }
  ];
  
  testCases.forEach((testCase, i) => {
    console.log(`${i+1}. Testing: ${testCase.vendorName}`);
    console.log(`   Filename: ${testCase.filename}`);
    
    // OLD method (using filename) - this was broken
    const oldSearchText = testCase.filename.toLowerCase();
    let oldCategory = 'general';
    for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
      if (keywords.some(keyword => oldSearchText.includes(keyword))) {
        oldCategory = cat;
        break;
      }
    }
    
    // NEW method (using vendor name + description) - this is the fix
    const newSearchText = `${testCase.vendorName} ${testCase.description}`.toLowerCase();
    let newCategory = 'general';
    for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
      if (keywords.some(keyword => newSearchText.includes(keyword))) {
        newCategory = cat;
        break;
      }
    }
    
    console.log(`   OLD (filename): ${oldCategory} ${oldCategory === testCase.expectedCategory ? '✅' : '❌'}`);
    console.log(`   NEW (vendor+desc): ${newCategory} ${newCategory === testCase.expectedCategory ? '✅' : '❌'}`);
    console.log('');
  });
}

testCategoryDetection();