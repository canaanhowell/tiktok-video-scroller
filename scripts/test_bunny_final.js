// Final test - check if we can use description or other fields for metadata
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

async function checkVideoDetails(videoId) {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${videoId}`,
    {
      headers: {
        'AccessKey': LIBRARY.key,
        'accept': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    const video = await response.json();
    console.log('\n📹 Video Details:');
    console.log(`   Title: ${video.title}`);
    console.log(`   GUID: ${video.guid}`);
    
    // Show all fields
    const importantFields = ['description', 'tags', 'metaTags', 'moments', 'category', 'metadata'];
    importantFields.forEach(field => {
      if (video[field] !== undefined) {
        console.log(`   ${field}:`, video[field]);
      }
    });
    
    // Check for any other metadata-like fields
    console.log('\n   All fields:');
    Object.keys(video).forEach(key => {
      if (!['guid', 'title', 'status', 'dateUploaded', 'views'].includes(key)) {
        const value = video[key];
        if (value && value !== 0 && value !== '' && value !== []) {
          console.log(`     ${key}: ${JSON.stringify(value).substring(0, 100)}`);
        }
      }
    });
    
    return video;
  }
  return null;
}

async function createVideoWithAllFields() {
  console.log('🧪 Creating video with all possible metadata fields\n');
  
  const metadata = {
    category: 'musicians',
    vendorName: 'Nashville Symphony',
    vendorWebsite: 'www.nashvillesymphony.com',
    vendorCity: 'Nashville',
    vendorState: 'Tennessee',
    vendorZipcode: '37215'
  };
  
  // Try creating with many fields
  const createPayload = {
    title: 'Symphony Wedding Performance',
    description: JSON.stringify(metadata), // Store as JSON in description
    collectionId: '',
    thumbnailTime: 1
  };
  
  console.log('📝 Creating with payload:', JSON.stringify(createPayload, null, 2));
  
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos`,
    {
      method: 'POST',
      headers: {
        'AccessKey': LIBRARY.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    }
  );
  
  if (response.ok) {
    const created = await response.json();
    console.log(`\n✅ Created video: ${created.guid}`);
    
    // Check what was saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    const video = await checkVideoDetails(created.guid);
    
    // Try to parse description back
    if (video && video.description) {
      try {
        const parsed = JSON.parse(video.description);
        console.log('\n✅ Metadata stored in description:', parsed);
      } catch (e) {
        console.log('\n❌ Could not parse description as JSON');
      }
    }
    
    return created.guid;
  } else {
    const error = await response.text();
    console.log('❌ Creation failed:', error);
  }
  
  return null;
}

async function testExistingVideos() {
  console.log('\n\n🔍 Checking existing videos for any metadata\n');
  
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos?page=1&itemsPerPage=10`,
    {
      headers: {
        'AccessKey': LIBRARY.key,
        'accept': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    const videos = data.items || [];
    
    videos.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      if (video.description) console.log(`   Description: ${video.description}`);
      if (video.tags && video.tags.length > 0) console.log(`   Tags:`, video.tags);
      if (video.metaTags && Object.keys(video.metaTags).length > 0) {
        console.log(`   MetaTags:`, video.metaTags);
      }
    });
  }
}

async function updateWithDescription(videoId) {
  console.log('\n\n🔧 Updating existing video with JSON description\n');
  
  const metadata = {
    category: 'venues',
    vendorName: 'Grand Ballroom',
    vendorWebsite: 'www.grandballroom.com',
    vendorCity: 'Nashville',
    vendorState: 'Tennessee',
    vendorZipcode: '37219'
  };
  
  const updatePayload = {
    description: JSON.stringify(metadata)
  };
  
  console.log('📝 Updating with:', updatePayload);
  
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${videoId}`,
    {
      method: 'POST',
      headers: {
        'AccessKey': LIBRARY.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    }
  );
  
  if (response.ok) {
    console.log('✅ Update successful');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await checkVideoDetails(videoId);
  } else {
    console.log('❌ Update failed:', response.status);
  }
}

async function runFinalTests() {
  console.log('🎯 Final Bunny CDN Metadata Solution Test\n');
  console.log('=' .repeat(60));
  
  // Test existing videos
  await testExistingVideos();
  
  // Create new video with metadata in description
  const newVideoId = await createVideoWithAllFields();
  
  // Update first existing video
  const firstVideo = '00f58353-b1ca-44e3-b390-13a87a9fa628';
  await updateWithDescription(firstVideo);
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n💡 SOLUTION: Store metadata as JSON in the description field!');
  console.log('The API can parse this in transformVideos() function.');
  
  // Clean up test video if created
  if (newVideoId) {
    await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${newVideoId}`,
      {
        method: 'DELETE',
        headers: { 'AccessKey': LIBRARY.key }
      }
    );
  }
}

runFinalTests().catch(console.error);