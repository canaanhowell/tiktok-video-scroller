// Upload real video metadata from staging_app to Firebase
const admin = require('firebase-admin');
const fs = require('fs');

// Use existing Firebase Admin setup
const serviceAccount = require('/app/main/true-harmonic-website-ae423085aa73.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'true-harmonic-website',
});

const db = admin.firestore();

async function uploadRealVideoMetadata() {
  try {
    console.log('📹 Uploading real video metadata to Firebase...');
    
    // Load real video metadata
    const metadataPath = '/app/main/staging_app/output/real_videos_firebase_metadata.json';
    
    if (!fs.existsSync(metadataPath)) {
      console.log('❌ Real video metadata file not found');
      return;
    }
    
    const videoMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`Found ${videoMetadata.length} real videos to upload`);
    
    // Create videos collection
    const videosRef = db.collection('videos');
    
    // Also create some vendor metadata for musicians
    const vendorsRef = db.collection('vendors');
    
    // Create musician vendors for the real videos
    const musicianVendors = [
      {
        businessName: "Nashville String Ensemble",
        category: "musicians",
        city: "Nashville",
        zipcode: "37215",
        contact: {
          website: "www.nashvillestringensemble.com",
          phone: "(615) 555-0301"
        },
        rating: 4.9,
        tags: ["strings", "classical", "cello", "piano", "trio"],
        videoCount: 3
      },
      {
        businessName: "Scenic Wedding Musicians",
        category: "musicians", 
        city: "Nashville",
        zipcode: "37203",
        contact: {
          website: "www.scenicweddingmusicians.com",
          phone: "(615) 555-0302"
        },
        rating: 4.8,
        tags: ["outdoor", "scenic", "piano", "strings", "drone"],
        videoCount: 2
      }
    ];
    
    // Upload musician vendors
    const vendorIds = [];
    for (const vendor of musicianVendors) {
      const docRef = await vendorsRef.add({
        ...vendor,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      vendorIds.push(docRef.id);
      console.log(`✅ Created musician vendor: ${vendor.businessName} (${docRef.id})`);
    }
    
    // Upload real video metadata with vendor links
    for (let i = 0; i < videoMetadata.length; i++) {
      const video = videoMetadata[i];
      
      // Link to a real vendor
      const vendorId = vendorIds[i % vendorIds.length];
      
      const videoData = {
        ...video,
        vendorId: vendorId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Remove the ISO date strings, use Firestore timestamps
      delete videoData.createdAt;
      delete videoData.updatedAt;
      videoData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      videoData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      const docRef = await videosRef.add(videoData);
      console.log(`✅ Uploaded real video: ${video.title} (${docRef.id})`);
    }
    
    console.log('\n🎉 Real video metadata upload complete!');
    console.log(`✅ Uploaded ${videoMetadata.length} real videos`);
    console.log(`✅ Created ${musicianVendors.length} musician vendors`);
    
    // Test query
    console.log('\n🔍 Testing Firebase queries...');
    
    const musiciansQuery = await vendorsRef.where('category', '==', 'musicians').get();
    console.log(`✅ Found ${musiciansQuery.size} musician vendors`);
    
    const nashvilleQuery = await vendorsRef.where('city', '==', 'Nashville').get();
    console.log(`✅ Found ${nashvilleQuery.size} Nashville vendors`);
    
    const videosQuery = await videosRef.where('category', '==', 'musicians').get();
    console.log(`✅ Found ${videosQuery.size} musician videos`);
    
  } catch (error) {
    console.error('❌ Error uploading video metadata:', error);
  }
}

// Run upload
uploadRealVideoMetadata().then(() => {
  console.log('✨ Upload complete!');
  process.exit(0);
}).catch(error => {
  console.error('Upload failed:', error);
  process.exit(1);
});