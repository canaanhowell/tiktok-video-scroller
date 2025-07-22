// Debug why Elegant Events Co shows as general
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function debugElegantEvents() {
  console.log('🕵️ Debugging Elegant Events Co categorization...\n');
  
  const vendorName = 'Elegant Events Co';
  const description = 'Elegant Events Co - Making your special day unforgettable 💕 | Nashville, Tennessee';
  
  console.log(`Vendor: "${vendorName}"`);
  console.log(`Description: "${description}"`);
  
  const searchText = `${vendorName} ${description}`.toLowerCase();
  console.log(`Search text: "${searchText}"`);
  
  console.log('\n🔍 Testing against each category:');
  
  for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
    const foundKeywords = keywords.filter(keyword => searchText.includes(keyword));
    if (foundKeywords.length > 0) {
      console.log(`✅ ${cat}: Found keywords: ${foundKeywords.join(', ')}`);
      console.log(`   First match wins, category would be: ${cat}`);
      break;
    } else {
      console.log(`❌ ${cat}: No matching keywords`);
    }
  }
  
  console.log('\n💡 The issue:');
  console.log('- "Elegant Events Co" contains no videography keywords');
  console.log('- It\'s in the videographers library but the vendor name is generic');
  console.log('- The description contains "special day" and "unforgettable" but no video-specific terms');
  console.log('- This causes it to default to "general"');
}

debugElegantEvents();