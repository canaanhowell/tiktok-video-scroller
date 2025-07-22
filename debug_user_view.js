// Debug what the user is actually seeing
const baseUrl = 'https://media.synthetikmedia.ai';

async function debugUserView() {
  console.log('🕵️ Debugging what user is actually seeing...\n');
  
  // Check all possible scenarios
  const scenarios = [
    { name: 'Default (no device param)', url: `${baseUrl}/api/bunny-videos` },
    { name: 'Mobile', url: `${baseUrl}/api/bunny-videos?device=mobile` },
    { name: 'Desktop', url: `${baseUrl}/api/bunny-videos?device=desktop` },
    { name: 'Tablet', url: `${baseUrl}/api/bunny-videos?device=tablet` }
  ];
  
  for (const scenario of scenarios) {
    console.log(`📱 ${scenario.name.toUpperCase()}:`);
    
    try {
      const response = await fetch(scenario.url);
      const data = await response.json();
      
      if (data.success && data.videos) {
        console.log(`   Library: ${data.libraryId}`);
        console.log(`   Videos: ${data.videos.length}`);
        
        // Look for videographer videos specifically
        const videographerVideos = data.videos.filter(v => 
          v.category === 'videographers' || 
          v.title.toLowerCase().includes('videographer')
        );
        
        console.log(`   Videographer videos: ${videographerVideos.length}`);
        
        if (videographerVideos.length > 0) {
          console.log('   📹 Videographer videos found:');
          videographerVideos.forEach(video => {
            console.log(`     - "${video.title}" -> category: "${video.category}"`);
          });
        }
        
        // Look for any videos with "general" category that could be misclassified
        const generalVideos = data.videos.filter(v => v.category === 'general');
        if (generalVideos.length > 0) {
          console.log(`   🚨 ${generalVideos.length} videos showing as "general":`);
          generalVideos.forEach(video => {
            console.log(`     - "${video.title}"`);
          });
        }
        
        // Look for musician and DJ videos to verify they're working
        const musicianVideos = data.videos.filter(v => v.category === 'musicians');
        const djVideos = data.videos.filter(v => v.category === 'djs');
        console.log(`   🎵 Musicians: ${musicianVideos.length}, 🎧 DJs: ${djVideos.length}`);
        
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Also check what would happen if user agent detection fails
  console.log('🔧 Testing edge cases:');
  console.log('   If device detection defaults to mobile (common fallback)');
  console.log('   User would see library 467029 with videographer content');
}

debugUserView();