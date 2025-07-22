// Update videos using the moments field for metadata storage
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

async function updateVideoWithMetadata(videoId, title, metadata) {
  console.log(`\n📹 Updating: ${title}`);
  
  // Store metadata as moments with timestamp 0
  // Format: label contains "key:value" pairs
  const moments = [
    { label: `category:${metadata.category}`, timestamp: 0 },
    { label: `vendorName:${metadata.vendorName}`, timestamp: 0 },
    { label: `vendorWebsite:${metadata.vendorWebsite}`, timestamp: 0 },
    { label: `vendorCity:${metadata.vendorCity}`, timestamp: 0 },
    { label: `vendorState:${metadata.vendorState}`, timestamp: 0 },
    { label: `vendorZipcode:${metadata.vendorZipcode}`, timestamp: 0 }
  ];
  
  const payload = { moments };
  
  console.log('   📝 Metadata:', JSON.stringify(metadata));
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${videoId}`,
      {
        method: 'POST',
        headers: {
          'AccessKey': LIBRARY.key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (response.ok) {
      // Verify the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${videoId}`,
        {
          headers: {
            'AccessKey': LIBRARY.key,
            'accept': 'application/json'
          }
        }
      );
      
      if (checkResponse.ok) {
        const video = await checkResponse.json();
        if (video.moments && video.moments.length > 0) {
          console.log('   ✅ SUCCESS! Metadata saved as moments');
          console.log('   Moments:', video.moments.map(m => m.label).join(', '));
          return true;
        }
      }
    } else {
      const error = await response.text();
      console.log('   ❌ Error:', error.substring(0, 100));
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
  }
  
  return false;
}

async function updateAllVideos() {
  console.log('🎬 Updating Videos with Metadata using Moments Field\n');
  console.log('=' .repeat(60));
  
  // Define metadata for each video
  const videosToUpdate = [
    {
      id: '00f58353-b1ca-44e3-b390-13a87a9fa628',
      title: '1',
      metadata: {
        category: 'venues',
        vendorName: 'Elegant Venues',
        vendorWebsite: 'www.elegantvenues.com',
        vendorCity: 'Nashville',
        vendorState: 'Tennessee',
        vendorZipcode: '37215'
      }
    },
    {
      id: '9683968a-f9ad-4c8e-b70a-601f99ac1f92',
      title: 'Side shot of hyper-realistic',
      metadata: {
        category: 'musicians',
        vendorName: 'Harmony Musicians',
        vendorWebsite: 'www.harmonymusicians.com',
        vendorCity: 'Memphis',
        vendorState: 'Tennessee',
        vendorZipcode: '38103'
      }
    },
    {
      id: '5406e7a8-f9b2-4dfb-b5bf-b4fbf76f1a01',
      title: 'Gen-4 slowmotion playing the cello',
      metadata: {
        category: 'musicians',
        vendorName: 'Nashville Strings',
        vendorWebsite: 'www.nashvillestrings.com',
        vendorCity: 'Nashville',
        vendorState: 'Tennessee',
        vendorZipcode: '37215'
      }
    }
  ];
  
  let successCount = 0;
  
  for (const video of videosToUpdate) {
    const success = await updateVideoWithMetadata(video.id, video.title, video.metadata);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`\n📊 Summary: Successfully updated ${successCount}/${videosToUpdate.length} videos`);
  
  if (successCount > 0) {
    console.log('\n✅ SUCCESS! Metadata has been stored in the moments field!');
    console.log('\n💡 Next step: Update /api/bunny-videos/route.ts to parse moments:');
    console.log('   1. Check video.moments array');
    console.log('   2. Parse "key:value" format from label field');
    console.log('   3. Use parsed metadata instead of fallback vendor names');
    console.log('\n🔍 Test at: https://media.synthetikmedia.ai');
  }
}

updateAllVideos().catch(console.error);