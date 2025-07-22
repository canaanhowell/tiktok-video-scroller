// Check what titles the API is actually returning for these problem videos
const baseUrl = 'https://media.synthetikmedia.ai';

async function debugAPITitles() {
  console.log('🔍 Checking actual API titles for problem videos...\n');
  
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=popular`);
  const data = await response.json();
  
  if (data.videos) {
    console.log('📊 All videos with titles and categories:');
    data.videos.forEach((video, i) => {
      console.log(`${i+1}. @${video.username}`);
      console.log(`   Title: "${video.title}"`);
      console.log(`   Description: "${video.description}"`);
      console.log(`   Category: "${video.category}"`);
      
      // Check if this is one of our problem cases
      const problemUsers = ['djspectacular', 'royalvenues', 'captureddreams'];
      if (problemUsers.includes(video.username)) {
        console.log(`   🚨 PROBLEM CASE - Let's debug:`);
        
        // Simulate detection with actual title
        const titleText = (video.title || '').toLowerCase();
        const vendorName = video.username;
        const description = video.description;
        const searchText = `${titleText} ${vendorName} ${description}`.toLowerCase();
        
        console.log(`   Search text: "${searchText}"`);
        
        const VENDOR_CATEGORIES = {
          venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
          photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
          videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
          musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
          djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
          general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
        };
        
        const categoryOrder = ['videographers', 'photographers', 'musicians', 'djs', 'venues', 'general'];
        for (const cat of categoryOrder) {
          const keywords = VENDOR_CATEGORIES[cat];
          const foundKeywords = keywords.filter(keyword => searchText.includes(keyword));
          if (foundKeywords.length > 0) {
            console.log(`   ✅ Should be: ${cat} (found: ${foundKeywords.join(', ')})`);
            break;
          }
        }
      }
      console.log('');
    });
  }
}

debugAPITitles();