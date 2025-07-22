// Test what the popular tab is actually returning
const baseUrl = 'https://media.synthetikmedia.ai';

async function testPopularTab() {
  console.log('🔥 Testing Popular tab API response...\n');
  
  // Test what popular tab actually returns
  const response = await fetch(`${baseUrl}/api/bunny-videos?category=popular`);
  const data = await response.json();
  
  console.log(`API Response for Popular tab:`);
  console.log(`Success: ${data.success}`);
  console.log(`Videos: ${data.videos?.length || 0}`);
  console.log(`Library: ${data.libraryId}`);
  console.log(`Category param: ${data.category}`);
  console.log('');
  
  if (data.videos) {
    console.log('📊 Videos in Popular tab:');
    data.videos.forEach((video, i) => {
      console.log(`${i+1}. "${video.vendorName}" (@${video.username})`);
      console.log(`   Description: ${video.description}`);
      console.log(`   🏷️ Category: "${video.category}"`);
      console.log(`   Expected for "${video.vendorName}":`, getExpectedCategory(video.vendorName, video.description));
      console.log('');
    });
  }
}

function getExpectedCategory(vendorName, description) {
  const VENDOR_CATEGORIES = {
    venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
    photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
    videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
    musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
    djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
    general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
  };
  
  const searchText = `${vendorName} ${description}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return cat;
    }
  }
  return 'general';
}

testPopularTab();