// Test live site at media.synthetikmedia.ai
const https = require('https');

const BASE_URL = 'https://media.synthetikmedia.ai';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`   Requesting: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          // For HTML responses
          resolve({ status: res.statusCode, data: data, isHtml: true });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testLiveSite() {
  console.log('🌐 Testing Live Site: media.synthetikmedia.ai');
  console.log('=' .repeat(50));
  
  const apiTests = [
    { name: 'Vendor Search (Musicians)', path: '/api/vendors/search?category=musicians' },
    { name: 'Vendor Stats', path: '/api/vendors/stats' },
    { name: 'Videos (Musicians)', path: '/api/videos?category=musicians' },
    { name: 'ZIP Code Search (37215)', path: '/api/vendors/search?zipcode=37215' },
    { name: 'City Search (Nashville)', path: '/api/vendors/search?city=Nashville' },
  ];
  
  console.log('\n📍 Testing API Endpoints:');
  let successCount = 0;
  
  for (const test of apiTests) {
    console.log(`\n${test.name}:`);
    try {
      const result = await makeRequest(test.path);
      
      if (result.status === 200) {
        successCount++;
        console.log(`   ✅ Status: ${result.status}`);
        
        if (!result.isHtml && result.data) {
          // Show summary of response
          if (result.data.hits) {
            console.log(`   📊 Results: ${result.data.hits.length} items found`);
            if (result.data.hits.length > 0) {
              console.log(`   📋 First result: ${result.data.hits[0].businessName || result.data.hits[0].title}`);
            }
          } else if (result.data.total !== undefined) {
            console.log(`   📊 Total: ${result.data.total}`);
          } else if (Array.isArray(result.data)) {
            console.log(`   📊 Results: ${result.data.length} items`);
            if (result.data.length > 0) {
              console.log(`   📋 First item: ${result.data[0].title || JSON.stringify(result.data[0]).substring(0, 50)}...`);
            }
          }
        }
      } else {
        console.log(`   ❌ Status: ${result.status}`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   Error: ${result.data.error || JSON.stringify(result.data).substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 LIVE SITE TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Successful API calls: ${successCount}/${apiTests.length}`);
  console.log(`🌐 Site URL: ${BASE_URL}`);
  
  if (successCount === apiTests.length) {
    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('The Firebase + Bunny CDN integration is fully functional.');
    console.log('\n📹 Next: Test video playback in browser to verify Bunny CDN streaming');
  } else {
    console.log('\n⚠️  Some API endpoints may need attention');
    console.log('Check the browser console for any client-side errors');
  }
  
  console.log('\n🔗 Test URLs:');
  console.log(`- Homepage: ${BASE_URL}`);
  console.log(`- Musicians: ${BASE_URL}?category=musicians`);
  console.log(`- Nashville vendors: ${BASE_URL}?city=Nashville`);
  console.log(`- ZIP 37215: ${BASE_URL}?zipcode=37215`);
}

// Run test
testLiveSite().then(() => {
  console.log('\n✨ Live site test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});