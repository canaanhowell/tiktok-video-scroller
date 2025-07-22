// Debug if moments are being parsed correctly
const baseUrl = 'https://media.synthetikmedia.ai';

async function debugMomentsParsing() {
  console.log('🔍 Debugging Moments Parsing\n');
  console.log('=' .repeat(60) + '\n');
  
  console.log('📊 Expected metadata from moments we set:');
  console.log('1. Video "1" → category: "venues", vendorName: "Elegant Venues"');
  console.log('2. Video "Side shot..." → category: "musicians", vendorName: "Harmony Musicians"');
  console.log('3. Video "Gen-4 slowmotion..." → category: "musicians", vendorName: "Nashville Strings"');
  console.log('\n');
  
  // Test the API
  const response = await fetch(`${baseUrl}/api/bunny-videos?device=desktop&category=default`);
  const data = await response.json();
  
  if (data.success && data.videos) {
    console.log('📡 Actual API response:');
    data.videos.forEach((video, i) => {
      console.log(`${i+1}. Video "${video.title}"`);
      console.log(`   → category: "${video.category}", vendorName: "${video.vendorName}"`);
      
      // Check if this matches expected
      if (video.title === '1' && video.category !== 'venues') {
        console.log(`   ❌ MISMATCH! Expected category "venues", got "${video.category}"`);
      } else if (video.title.includes('Side shot') && video.category !== 'musicians') {
        console.log(`   ❌ MISMATCH! Expected category "musicians", got "${video.category}"`);
      } else if (video.title.includes('Gen-4') && video.category !== 'musicians') {
        console.log(`   ❌ MISMATCH! Expected category "musicians", got "${video.category}"`);
      }
      console.log('');
    });
    
    console.log('=' .repeat(60));
    console.log('\n💡 Analysis:');
    
    // Check if any video has the correct metadata
    const hasCorrectMetadata = data.videos.some(v => 
      (v.vendorName === 'Elegant Venues' && v.category === 'venues') ||
      (v.vendorName === 'Harmony Musicians' && v.category === 'musicians') ||
      (v.vendorName === 'Nashville Strings' && v.category === 'musicians')
    );
    
    if (hasCorrectMetadata) {
      console.log('✅ At least some videos have correct metadata from moments!');
      console.log('The parsing is working but may need deployment.');
    } else {
      console.log('❌ None of the videos have the metadata we set in moments!');
      console.log('\nPossible issues:');
      console.log('1. The API code with moments parsing is not deployed yet');
      console.log('2. The API is still using cached/old logic');
      console.log('3. The moments parsing code has a bug');
      
      // Check if it's still using fallback vendor names
      const usingFallback = data.videos.some(v => 
        v.vendorName === 'Elegant Events Co' || 
        v.vendorName === 'Golden Hour Photography' ||
        v.vendorName === 'Cinematic Weddings'
      );
      
      if (usingFallback) {
        console.log('\n🚨 The API is still using FALLBACK vendor names!');
        console.log('This means the moments parsing is NOT active.');
      }
    }
  }
}

debugMomentsParsing().catch(console.error);