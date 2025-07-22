// Test using tags field for metadata storage
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

async function updateVideoWithTags(videoId, metadata) {
  console.log(`\n🏷️  Updating video ${videoId} with tags approach`);
  
  // Store metadata as structured tags
  const tags = [
    `category:${metadata.category}`,
    `vendorName:${metadata.vendorName}`,
    `vendorWebsite:${metadata.vendorWebsite}`,
    `vendorCity:${metadata.vendorCity}`,
    `vendorState:${metadata.vendorState}`,
    `vendorZipcode:${metadata.vendorZipcode}`
  ];
  
  const payload = {
    tags: tags
  };
  
  console.log('📝 Payload:', JSON.stringify(payload, null, 2));
  
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
    
    console.log(`Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.log('Error:', error);
      return false;
    }
    
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
      console.log('\n✅ Video updated! Current data:');
      console.log('   Title:', video.title);
      console.log('   Tags:', video.tags);
      console.log('   Description:', video.description);
      console.log('   MetaTags:', video.metaTags);
      
      return video.tags && video.tags.length > 0;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  return false;
}

async function createVideoWithTags() {
  console.log('🆕 Creating new video with tags\n');
  
  const metadata = {
    category: 'photographers',
    vendorName: 'Sunset Photography',
    vendorWebsite: 'www.sunsetphoto.com',
    vendorCity: 'Nashville',
    vendorState: 'Tennessee',
    vendorZipcode: '37203'
  };
  
  const tags = [
    `category:${metadata.category}`,
    `vendorName:${metadata.vendorName}`,
    `vendorWebsite:${metadata.vendorWebsite}`,
    `vendorCity:${metadata.vendorCity}`,
    `vendorState:${metadata.vendorState}`,
    `vendorZipcode:${metadata.vendorZipcode}`
  ];
  
  const payload = {
    title: 'Sunset Photography Wedding',
    tags: tags,
    collectionId: '',
    thumbnailTime: 1
  };
  
  console.log('📝 Creating with payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos`,
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
      const created = await response.json();
      console.log(`\n✅ Created video: ${created.guid}`);
      
      // Check what was saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${created.guid}`,
        {
          headers: {
            'AccessKey': LIBRARY.key,
            'accept': 'application/json'
          }
        }
      );
      
      if (checkResponse.ok) {
        const video = await checkResponse.json();
        console.log('\n📹 Created video details:');
        console.log('   Title:', video.title);
        console.log('   Tags:', video.tags);
        console.log('   MetaTags:', video.metaTags);
        
        if (video.tags && video.tags.length > 0) {
          console.log('\n✅ SUCCESS! Tags were saved!');
          console.log('This can be used for metadata storage.');
        }
      }
      
      // Clean up
      await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${created.guid}`,
        {
          method: 'DELETE',
          headers: { 'AccessKey': LIBRARY.key }
        }
      );
      
      return created.guid;
    } else {
      const error = await response.text();
      console.log('❌ Creation failed:', error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  return null;
}

async function updateExistingVideos() {
  console.log('📊 Updating existing videos with metadata tags\n');
  
  const videoMetadata = [
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
  
  for (const video of videoMetadata) {
    const success = await updateVideoWithTags(video.id, video.metadata);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return successCount;
}

async function testTagsApproach() {
  console.log('🏷️  Testing Tags Approach for Metadata Storage\n');
  console.log('=' .repeat(60));
  
  // Test creating with tags
  await createVideoWithTags();
  
  // Update existing videos
  const updated = await updateExistingVideos();
  
  console.log('\n' + '=' .repeat(60));
  console.log(`\n📊 Summary: Updated ${updated}/3 existing videos`);
  
  if (updated > 0) {
    console.log('\n✅ SUCCESS! Tags can be used for metadata storage!');
    console.log('\n💡 Next steps:');
    console.log('1. Update API to parse tags in format "key:value"');
    console.log('2. Extract metadata from tags array');
    console.log('3. Use extracted metadata instead of fallback vendor names');
  }
}

testTagsApproach().catch(console.error);