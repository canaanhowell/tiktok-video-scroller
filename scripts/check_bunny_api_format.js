// Check what fields are actually supported by Bunny CDN API
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

async function tryUpdateField(videoId, fieldName, value) {
  console.log(`\n🧪 Testing field: ${fieldName}`);
  console.log(`   Value:`, value);
  
  const payload = {
    [fieldName]: value
  };
  
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
    
    console.log(`   Response: ${response.status}`);
    
    if (response.ok) {
      // Check if field was saved
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
        const savedValue = video[fieldName];
        
        if (savedValue !== undefined && savedValue !== null && 
            JSON.stringify(savedValue) !== JSON.stringify(value === '' ? null : [])) {
          console.log(`   ✅ SAVED! Current value:`, savedValue);
          return true;
        } else {
          console.log(`   ❌ Not saved (current:`, savedValue, `)`);
        }
      }
    } else {
      const error = await response.text();
      console.log(`   ❌ Error:`, error.substring(0, 100));
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message);
  }
  
  return false;
}

async function testAllFields() {
  console.log('🔍 Testing Bunny CDN Supported Fields\n');
  console.log('=' .repeat(60));
  
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
  
  // Fields to test
  const fieldsToTest = [
    { name: 'title', value: 'Updated Title Test' },
    { name: 'description', value: 'Test description with metadata' },
    { name: 'tags', value: ['test', 'metadata', 'wedding'] },
    { name: 'category', value: 'wedding' },
    { name: 'collectionId', value: 'test-collection' },
    { name: 'chapters', value: [{ title: 'Chapter 1', time: 0 }] },
    { name: 'moments', value: [{ label: 'Test Moment', timestamp: 0 }] },
    { name: 'captions', value: [{ srclang: 'en', label: 'English' }] },
    { name: 'metaTags', value: { test: 'value' } },
    { name: 'customData', value: { category: 'musicians' } },
    { name: 'metadata', value: { category: 'musicians' } },
    { name: 'isPublic', value: true }
  ];
  
  const workingFields = [];
  
  for (const field of fieldsToTest) {
    const works = await tryUpdateField(video.guid, field.name, field.value);
    if (works) {
      workingFields.push(field.name);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Summary:');
  
  if (workingFields.length > 0) {
    console.log('\n✅ Working fields:', workingFields.join(', '));
    console.log('\nThese fields can be updated via the API!');
    
    // Reset title if it was changed
    if (workingFields.includes('title')) {
      await tryUpdateField(video.guid, 'title', video.title);
    }
  } else {
    console.log('\n❌ No fields could be updated!');
    console.log('The API may be read-only or require different authentication.');
  }
}

testAllFields().catch(console.error);