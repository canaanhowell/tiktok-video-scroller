// Debug the specific misclassifications
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function debugMisclassifications() {
  console.log('🔍 Debugging misclassifications...\n');
  
  const problemCases = [
    {
      username: 'djspectacular',
      description: 'DJ Spectacular - Love stories beautifully told 💍 | Nashville, Tennessee',
      actualCategory: 'photographers',
      expectedCategory: 'djs'
    },
    {
      username: 'royalvenues', 
      description: 'Royal Venues - Your perfect day, our passion 💖 | Nashville, Tennessee',
      actualCategory: 'djs',
      expectedCategory: 'venues'
    },
    {
      username: 'captureddreams',
      description: 'Captured Dreams - Making memories that matter 🎉 | Nashville, Tennessee', 
      actualCategory: 'djs',
      expectedCategory: 'photographers'
    }
  ];
  
  problemCases.forEach((testCase, i) => {
    console.log(`${i+1}. ${testCase.username} → ${testCase.actualCategory} (expected: ${testCase.expectedCategory})`);
    console.log(`   Description: "${testCase.description}"`);
    
    // Simulate the detection logic
    const titleText = ''; // No title info in logs
    const vendorName = testCase.username;
    const description = testCase.description;
    const searchText = `${titleText} ${vendorName} ${description}`.toLowerCase();
    
    console.log(`   Search text: "${searchText}"`);
    console.log('   Keyword matches:');
    
    const categoryOrder = ['videographers', 'photographers', 'musicians', 'djs', 'venues', 'general'];
    for (const cat of categoryOrder) {
      const keywords = VENDOR_CATEGORIES[cat];
      const foundKeywords = keywords.filter(keyword => searchText.includes(keyword));
      if (foundKeywords.length > 0) {
        console.log(`     ✅ ${cat}: ${foundKeywords.join(', ')} → DETECTED`);
        break;
      } else {
        console.log(`     ❌ ${cat}: no matches`);
      }
    }
    console.log('');
  });
}

debugMisclassifications();