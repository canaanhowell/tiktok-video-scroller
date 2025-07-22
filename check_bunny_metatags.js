// Check if Bunny CDN videos have metaTags
const baseUrl = 'https://media.synthetikmedia.ai';

async function checkBunnyMetaTags() {
  console.log('🔍 Checking Bunny CDN metaTags\n');
  
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=popular`);
  const data = await response.json();
  
  if (data.videos) {
    console.log(`📊 Checking ${data.videos.length} videos for metaTags:\n`);
    
    let hasMetaTags = 0;
    let noMetaTags = 0;
    
    data.videos.forEach((video, i) => {
      console.log(`Video ${i+1}: @${video.username}`);
      console.log(`  vendorName: "${video.vendorName}"`);
      console.log(`  category: "${video.category}"`);
      console.log(`  metaTags:`, video.metaTags || 'NOT EXPOSED IN API RESPONSE');
      
      // Check if this looks like a fallback vendor name
      const VENDOR_NAMES = [
        'Elegant Events Co',
        'Golden Hour Photography', 
        'Cinematic Weddings',
        'The Music Masters',
        'DJ Spectacular',
        'Forever Films',
        'Blissful Moments',
        'Royal Venues',
        'Harmony Musicians',
        'Captured Dreams',
      ];
      
      const expectedName = VENDOR_NAMES[i % VENDOR_NAMES.length];
      if (video.vendorName === expectedName) {
        console.log(`  ⚠️ USING FALLBACK! Expected at index ${i}: "${expectedName}"`);
        noMetaTags++;
      } else {
        console.log(`  ✅ Has real vendor data (not "${expectedName}")`);
        hasMetaTags++;
      }
      console.log('');
    });
    
    console.log('📊 Summary:');
    console.log(`Videos with real vendor data: ${hasMetaTags}`);
    console.log(`Videos using fallback data: ${noMetaTags}`);
    
    if (noMetaTags === data.videos.length) {
      console.log('\n🚨 ALL VIDEOS ARE USING FALLBACK DATA!');
      console.log('This confirms the Bunny CDN videos do not have metaTags set.');
      console.log('The sequential category pattern is caused by the fallback vendor names.');
    }
  }
}

checkBunnyMetaTags();