// Test what videos are actually being displayed to user
const baseUrl = 'https://media.synthetikmedia.ai';

async function testActualDisplay() {
  console.log('🔍 Testing what videos are actually displayed...\n');
  
  // Test desktop (what user is likely seeing)
  console.log('🖥️ DESKTOP VIEW:');
  const desktopResponse = await fetch(`${baseUrl}/api/bunny-videos?device=desktop`);
  const desktopData = await desktopResponse.json();
  
  console.log(`Library: ${desktopData.libraryId}`);
  console.log(`Total videos: ${desktopData.videos?.length || 0}\n`);
  
  if (desktopData.videos) {
    console.log('📋 All videos being shown on desktop:');
    desktopData.videos.forEach((video, i) => {
      console.log(`${i+1}. "${video.title}"`);
      console.log(`   📊 Category: "${video.category}"`);
      console.log(`   👤 Vendor: ${video.vendorName}`);
      console.log(`   📝 Description: ${video.description}`);
      console.log('');
    });
    
    // Specifically look for any videos that show "general" when they should be categorized
    const suspiciousVideos = desktopData.videos.filter(video => {
      const title = video.title.toLowerCase();
      const hasVideoKeywords = title.includes('video') || title.includes('film') || title.includes('cinema');
      const hasMusicKeywords = title.includes('music') || title.includes('musician') || title.includes('band');
      const hasDJKeywords = title.includes('dj') || title.includes('mix') || title.includes('party');
      
      return (hasVideoKeywords || hasMusicKeywords || hasDJKeywords) && video.category === 'general';
    });
    
    if (suspiciousVideos.length > 0) {
      console.log('🚨 Videos that should be categorized but show as "general":');
      suspiciousVideos.forEach(video => {
        console.log(`  - "${video.title}" (category: ${video.category})`);
      });
    }
    
    // Check if there are any videographer videos at all
    const videographerVideos = desktopData.videos.filter(v => 
      v.category === 'videographers' || 
      v.title.toLowerCase().includes('video') ||
      v.title.toLowerCase().includes('film') ||
      v.title.toLowerCase().includes('cinema')
    );
    
    console.log(`\n📹 Videographer-related videos: ${videographerVideos.length}`);
    if (videographerVideos.length > 0) {
      videographerVideos.forEach(video => {
        console.log(`  - "${video.title}" -> category: ${video.category}`);
      });
    }
  }
}

testActualDisplay();