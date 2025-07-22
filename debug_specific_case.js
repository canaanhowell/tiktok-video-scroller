// Debug the specific problematic case
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function debugSpecificCase() {
  console.log('🔍 Debugging: "Forever Films - Videographers Showcase" + "Golden Hour Photography"\n');
  
  const title = 'Forever Films - Videographers Showcase';
  const vendor = 'Golden Hour Photography';
  const searchText = `${title} ${vendor}`.toLowerCase();
  
  console.log(`Title: "${title}"`);
  console.log(`Vendor: "${vendor}"`);
  console.log(`Search text: "${searchText}"`);
  console.log('');
  
  console.log('🔍 Checking each category:');
  
  const categoryOrder = ['videographers', 'photographers', 'musicians', 'djs', 'venues', 'general'];
  for (const cat of categoryOrder) {
    const keywords = VENDOR_CATEGORIES[cat];
    const foundKeywords = keywords.filter(keyword => searchText.includes(keyword));
    
    if (foundKeywords.length > 0) {
      console.log(`✅ ${cat}: Found keywords: ${foundKeywords.join(', ')}`);
      console.log(`   This would be the detected category!`);
      break;
    } else {
      console.log(`❌ ${cat}: No matching keywords`);
    }
  }
  
  console.log('\n💡 The issue:');
  console.log('- Title contains "videographers" → should be videographers');
  console.log('- Vendor contains "photography" → matches photographers'); 
  console.log('- We need to prioritize title keywords over vendor keywords');
}

debugSpecificCase();