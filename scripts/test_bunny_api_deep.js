// Deep test of Bunny CDN API to find the correct metadata format
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

// Test creating a new video with metadata in different formats
async function testCreateWithMetadata() {
  console.log('🧪 Testing video creation with metadata\n');
  
  const testFormats = [
    {
      name: 'Array of key-value pairs',
      payload: {
        title: 'Metadata Test 1',
        metaTags: [
          { key: 'category', value: 'musicians' },
          { key: 'vendorName', value: 'Test Vendor' },
          { key: 'vendorCity', value: 'Nashville' }
        ]
      }
    },
    {
      name: 'Array of strings',
      payload: {
        title: 'Metadata Test 2',
        metaTags: ['category:musicians', 'vendorName:Test Vendor', 'vendorCity:Nashville']
      }
    },
    {
      name: 'Comma-separated string',
      payload: {
        title: 'Metadata Test 3',
        metaTags: 'category:musicians,vendorName:Test Vendor,vendorCity:Nashville'
      }
    },
    {
      name: 'Individual meta properties',
      payload: {
        title: 'Metadata Test 4',
        metaTagCategory: 'musicians',
        metaTagVendorName: 'Test Vendor',
        metaTagVendorCity: 'Nashville'
      }
    },
    {
      name: 'Tags array (like YouTube)',
      payload: {
        title: 'Metadata Test 5',
        tags: ['musicians', 'Test Vendor', 'Nashville', 'wedding']
      }
    }
  ];
  
  for (const format of testFormats) {
    console.log(`\n📝 Testing: ${format.name}`);
    console.log(`   Payload:`, JSON.stringify(format.payload, null, 2));
    
    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos`,
        {
          method: 'POST',
          headers: {
            'AccessKey': LIBRARY.key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(format.payload)
        }
      );
      
      console.log(`   Response: ${response.status}`);
      
      if (response.ok) {
        const created = await response.json();
        console.log(`   ✅ Created: ${created.guid}`);
        
        // Check what was saved
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
          console.log(`   MetaTags saved:`, video.metaTags);
          console.log(`   Tags saved:`, video.tags);
          
          // Clean up - delete test video
          await fetch(
            `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${created.guid}`,
            {
              method: 'DELETE',
              headers: { 'AccessKey': LIBRARY.key }
            }
          );
        }
      } else {
        const error = await response.text();
        console.log(`   ❌ Error:`, error.substring(0, 150));
      }
    } catch (error) {
      console.log(`   ❌ Exception:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Test updating existing video
async function testUpdateMethods() {
  console.log('\n\n🧪 Testing update methods on existing video\n');
  
  // Get first video
  const listResponse = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos?page=1&itemsPerPage=1`,
    {
      headers: {
        'AccessKey': LIBRARY.key,
        'accept': 'application/json'
      }
    }
  );
  
  if (!listResponse.ok) {
    console.log('❌ Could not get video list');
    return;
  }
  
  const data = await listResponse.json();
  const video = data.items?.[0];
  
  if (!video) {
    console.log('❌ No videos found');
    return;
  }
  
  console.log(`📹 Test video: ${video.title} (${video.guid})\n`);
  
  // Check all available fields
  console.log('📋 Current video fields:');
  Object.keys(video).forEach(key => {
    if (key.toLowerCase().includes('tag') || key.toLowerCase().includes('meta')) {
      console.log(`   ${key}:`, video[key]);
    }
  });
  
  // Try different update payloads
  const updateFormats = [
    {
      name: 'Update with tags array',
      payload: {
        tags: ['musicians', 'wedding', 'nashville', 'Test Vendor']
      }
    },
    {
      name: 'Update with description containing metadata',
      payload: {
        description: 'category:musicians|vendorName:Test Vendor|vendorCity:Nashville'
      }
    },
    {
      name: 'Update with chapter markers (alternative metadata)',
      payload: {
        chapters: [
          { title: 'category:musicians', time: 0 },
          { title: 'vendorName:Test Vendor', time: 1 },
          { title: 'vendorCity:Nashville', time: 2 }
        ]
      }
    },
    {
      name: 'Update with moments (alternative metadata)',
      payload: {
        moments: [
          { label: 'category', value: 'musicians', timestamp: 0 },
          { label: 'vendorName', value: 'Test Vendor', timestamp: 0 },
          { label: 'vendorCity', value: 'Nashville', timestamp: 0 }
        ]
      }
    }
  ];
  
  for (const format of updateFormats) {
    console.log(`\n📝 Testing: ${format.name}`);
    console.log(`   Payload:`, JSON.stringify(format.payload, null, 2));
    
    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${video.guid}`,
        {
          method: 'POST',
          headers: {
            'AccessKey': LIBRARY.key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(format.payload)
        }
      );
      
      console.log(`   Response: ${response.status}`);
      
      if (response.ok) {
        // Check what was saved
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
          const updated = await checkResponse.json();
          
          // Check all fields that might have changed
          ['tags', 'description', 'chapters', 'moments', 'metaTags'].forEach(field => {
            if (updated[field] !== undefined && 
                JSON.stringify(updated[field]) !== JSON.stringify(video[field])) {
              console.log(`   ✅ ${field} updated:`, updated[field]);
            }
          });
        }
      } else {
        const error = await response.text();
        console.log(`   ❌ Error:`, error.substring(0, 150));
      }
    } catch (error) {
      console.log(`   ❌ Exception:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔬 Deep Bunny CDN API Testing\n');
  console.log('=' .repeat(60));
  
  await testCreateWithMetadata();
  await testUpdateMethods();
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📌 Summary: Check which format successfully saved metadata above.');
}

runAllTests().catch(console.error);