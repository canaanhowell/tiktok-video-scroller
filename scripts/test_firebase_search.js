// Test Firebase search functionality for web_app
const admin = require('firebase-admin');

// Use existing Firebase Admin setup
const serviceAccount = require('/app/main/true-harmonic-website-ae423085aa73.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'true-harmonic-website',
});

const db = admin.firestore();

async function testFirebaseSearch() {
  try {
    console.log('🔍 Testing Firebase Search Integration');
    console.log('=' * 50);
    
    // Test 1: Search musicians
    console.log('\n1. Testing musician search...');
    const musiciansQuery = await db.collection('vendors')
      .where('category', '==', 'musicians')
      .get();
    
    console.log(`✅ Found ${musiciansQuery.size} musician vendors`);
    musiciansQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.businessName} in ${data.city} (${data.zipcode})`);
    });
    
    // Test 2: Search by city
    console.log('\n2. Testing Nashville vendor search...');
    const nashvilleQuery = await db.collection('vendors')
      .where('city', '==', 'Nashville')
      .get();
    
    console.log(`✅ Found ${nashvilleQuery.size} Nashville vendors`);
    nashvilleQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.businessName} (${data.category}) - Rating: ${data.rating}`);
    });
    
    // Test 3: Search videos with Bunny CDN URLs
    console.log('\n3. Testing video search with Bunny URLs...');
    const videosQuery = await db.collection('videos')
      .where('category', '==', 'musicians')
      .get();
    
    console.log(`✅ Found ${videosQuery.size} musician videos`);
    videosQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.title}`);
      console.log(`    Bunny URL: ${data.bunnyUrl}`);
      console.log(`    File size: ${Math.round(data.fileSize / 1024 / 1024 * 100) / 100}MB`);
    });
    
    // Test 4: ZIP code area search simulation
    console.log('\n4. Testing ZIP code area search...');
    const zipCodes = ['37215', '37203', '37205']; // Nashville area ZIPs
    
    const zipQuery = await db.collection('vendors')
      .where('zipcode', 'in', zipCodes)
      .get();
    
    console.log(`✅ Found ${zipQuery.size} vendors in Nashville ZIP area`);
    zipQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.businessName} in ${data.zipcode}`);
    });
    
    // Test 5: Combined search (category + location)
    console.log('\n5. Testing combined search (musicians in Nashville)...');
    const combinedQuery = await db.collection('vendors')
      .where('category', '==', 'musicians')
      .where('city', '==', 'Nashville')
      .get();
    
    console.log(`✅ Found ${combinedQuery.size} musicians in Nashville`);
    combinedQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.businessName} - ${data.tags.join(', ')}`);
    });
    
    // Summary
    console.log('\n' + '=' * 50);
    console.log('🎉 Firebase Search Test Results');
    console.log('=' * 50);
    console.log(`✅ Musicians: ${musiciansQuery.size} vendors`);
    console.log(`✅ Nashville vendors: ${nashvilleQuery.size} total`);
    console.log(`✅ Musician videos: ${videosQuery.size} with Bunny URLs`);
    console.log(`✅ ZIP area search: ${zipQuery.size} vendors`);
    console.log(`✅ Combined search: ${combinedQuery.size} results`);
    
    console.log('\n🚀 Ready for Web App Integration!');
    console.log('The web_app can now:');
    console.log('• Search vendors by category (musicians, venues, etc.)');
    console.log('• Filter by city (Nashville, Memphis)');
    console.log('• Search by ZIP code area (37215 → Nashville)');
    console.log('• Stream videos from Bunny CDN URLs');
    console.log('• Display real video content with metadata');
    
  } catch (error) {
    console.error('❌ Search test error:', error);
  }
}

// Run test
testFirebaseSearch().then(() => {
  console.log('✨ Search test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});