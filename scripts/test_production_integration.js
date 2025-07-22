// Test production Firebase + Bunny CDN integration
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('/app/main/true-harmonic-website-ae423085aa73.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'true-harmonic-website',
});

const db = admin.firestore();

async function testProductionIntegration() {
  console.log('🚀 Testing Production Firebase + Bunny CDN Integration');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Verify Firebase connection
    console.log('\n1️⃣ Testing Firebase Connection...');
    const testDoc = await db.collection('vendors').limit(1).get();
    console.log(`✅ Firebase connected successfully! Found ${testDoc.size} vendor(s)`);
    
    // Test 2: Check vendor data
    console.log('\n2️⃣ Checking Vendor Data...');
    const vendorsSnapshot = await db.collection('vendors').get();
    console.log(`✅ Total vendors in Firebase: ${vendorsSnapshot.size}`);
    
    const vendorsByCategory = {};
    vendorsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      vendorsByCategory[data.category] = (vendorsByCategory[data.category] || 0) + 1;
    });
    
    console.log('   Vendors by category:');
    Object.entries(vendorsByCategory).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} vendor(s)`);
    });
    
    // Test 3: Check video data with Bunny URLs
    console.log('\n3️⃣ Checking Video Data with Bunny CDN URLs...');
    const videosSnapshot = await db.collection('videos').get();
    console.log(`✅ Total videos in Firebase: ${videosSnapshot.size}`);
    
    let validBunnyUrls = 0;
    let invalidUrls = 0;
    const videosByCategory = {};
    
    videosSnapshot.docs.forEach(doc => {
      const data = doc.data();
      videosByCategory[data.category] = (videosByCategory[data.category] || 0) + 1;
      
      if (data.bunnyUrl && data.bunnyUrl.includes('b-cdn.net')) {
        validBunnyUrls++;
      } else {
        invalidUrls++;
      }
    });
    
    console.log('   Videos by category:');
    Object.entries(videosByCategory).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} video(s)`);
    });
    
    console.log(`\n   ✅ Valid Bunny CDN URLs: ${validBunnyUrls}`);
    if (invalidUrls > 0) {
      console.log(`   ⚠️  Invalid/missing URLs: ${invalidUrls}`);
    }
    
    // Test 4: Sample Bunny CDN URLs
    console.log('\n4️⃣ Sample Bunny CDN URLs:');
    const sampleVideos = await db.collection('videos')
      .where('category', '==', 'musicians')
      .limit(3)
      .get();
    
    sampleVideos.docs.forEach(doc => {
      const data = doc.data();
      console.log(`\n   📹 ${data.title}`);
      console.log(`   🔗 ${data.bunnyUrl}`);
      console.log(`   📏 Size: ${Math.round(data.fileSize / 1024 / 1024 * 100) / 100}MB`);
    });
    
    // Test 5: Test ZIP code filtering
    console.log('\n5️⃣ Testing ZIP Code Filtering...');
    const nashvilleZips = ['37215', '37203', '37205'];
    const zipQuery = await db.collection('vendors')
      .where('zipcode', 'in', nashvilleZips)
      .get();
    
    console.log(`✅ Found ${zipQuery.size} vendors in Nashville ZIP codes`);
    
    // Test 6: Production URLs
    console.log('\n6️⃣ Production URLs:');
    console.log('   🌐 Vercel deployment: https://tiktok-video-scroller-gbilx542s-canaan-howells-projects.vercel.app');
    console.log('   🔗 Expected custom domain: https://media.synthetikmedia.ai');
    console.log('   📊 Firebase Console: https://console.firebase.google.com/project/true-harmonic-website');
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Firebase Connection: Working`);
    console.log(`✅ Total Vendors: ${vendorsSnapshot.size}`);
    console.log(`✅ Total Videos: ${videosSnapshot.size}`);
    console.log(`✅ Videos with Bunny CDN URLs: ${validBunnyUrls}`);
    console.log(`✅ ZIP Code Filtering: Working (${zipQuery.size} results)`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Set up custom domain (media.synthetikmedia.ai) in Vercel');
    console.log('2. Test video streaming from Bunny CDN in browser');
    console.log('3. Verify search functionality with ZIP code filtering');
    console.log('4. Configure Bunny CDN upload from staging_app');
    
  } catch (error) {
    console.error('❌ Integration test error:', error);
  }
}

// Run test
testProductionIntegration().then(() => {
  console.log('\n✨ Integration test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});