// Test different methods to set metadata on Bunny CDN videos
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

// Get the first video to test with
async function getTestVideo() {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos?page=1&itemsPerPage=1`,
    {
      headers: {
        'AccessKey': LIBRARY.key,
        'accept': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    return data.items?.[0];
  }
  return null;
}

async function testMetadataMethod(video, method, payload) {
  console.log(`\n🧪 Testing: ${method.description}`);
  console.log(`   Payload:`, JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${video.guid}`,
      {
        method: method.httpMethod,
        headers: {
          'AccessKey': LIBRARY.key,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
    
    console.log(`   Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`   Error:`, text.substring(0, 200));
    } else {
      // Check if metadata was saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${video.guid}`,
        {
          headers: {
            'AccessKey': LIBRARY.key,
            'accept': 'application/json'
          }
        }
      );
      
      if (checkResponse.ok) {
        const updatedVideo = await checkResponse.json();
        if (updatedVideo.metaTags && Object.keys(updatedVideo.metaTags).length > 0) {
          console.log(`   ✅ SUCCESS! Metadata saved:`, updatedVideo.metaTags);
          return true;
        } else {
          console.log(`   ❌ Metadata not saved`);
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
  
  return false;
}

async function testAllMethods() {
  console.log('🔬 Testing Bunny CDN Metadata Methods\n');
  console.log('=' .repeat(60));
  
  const video = await getTestVideo();
  if (!video) {
    console.log('❌ No videos found to test with');
    return;
  }
  
  console.log(`📹 Test video: ${video.title}`);
  console.log(`   GUID: ${video.guid}`);
  console.log(`   Current metaTags:`, video.metaTags || 'None');
  
  const testMetadata = {
    category: 'musicians',
    vendorName: 'Test Vendor',
    vendorWebsite: 'www.testvendor.com',
    vendorCity: 'Nashville',
    vendorState: 'Tennessee'
  };
  
  // Different methods to try
  const methods = [
    {
      description: 'POST with metaTags wrapper',
      httpMethod: 'POST',
      payload: { metaTags: testMetadata }
    },
    {
      description: 'POST with direct properties',
      httpMethod: 'POST',
      payload: testMetadata
    },
    {
      description: 'PUT with metaTags wrapper',
      httpMethod: 'PUT',
      payload: { metaTags: testMetadata }
    },
    {
      description: 'PATCH with metaTags wrapper',
      httpMethod: 'PATCH',
      payload: { metaTags: testMetadata }
    },
    {
      description: 'POST with title and metaTags',
      httpMethod: 'POST',
      payload: { 
        title: video.title,
        metaTags: testMetadata 
      }
    },
    {
      description: 'POST with camelCase meta tags as strings',
      httpMethod: 'POST',
      payload: { 
        metaTags: {
          Category: 'musicians',
          VendorName: 'Test Vendor',
          VendorWebsite: 'www.testvendor.com',
          VendorCity: 'Nashville',
          VendorState: 'Tennessee'
        }
      }
    }
  ];
  
  let successfulMethod = null;
  
  for (const method of methods) {
    const success = await testMetadataMethod(video, method, method.payload);
    if (success) {
      successfulMethod = method;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (successfulMethod) {
    console.log('\n✅ SUCCESS! Working method found:');
    console.log(`   ${successfulMethod.description}`);
    console.log('\n📝 Use this format for metadata updates!');
  } else {
    console.log('\n❌ No working method found!');
    console.log('Bunny CDN may not support metadata updates via API.');
    console.log('\n💡 Alternative: Set metadata during video creation or use Bunny CDN dashboard.');
  }
}

testAllMethods().catch(console.error);