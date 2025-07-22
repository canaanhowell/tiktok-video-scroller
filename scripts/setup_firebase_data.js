// Setup Firebase data - populate collections with sample vendor data
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('/app/main/true-harmonic-website-ae423085aa73.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'true-harmonic-website',
});

const db = admin.firestore();

// Sample vendor data based on our batch_videos.json
const sampleVendors = [
  {
    businessName: "Scenic Mountain Venues",
    category: "venues", 
    city: "Nashville",
    zipcode: "37215",
    contact: {
      website: "www.scenicmountainvenues.com",
      phone: "(615) 555-0101",
      email: "info@scenicmountainvenues.com"
    },
    rating: 4.8,
    tags: ["outdoor", "scenic", "mountain", "rustic", "large capacity"],
    videoCount: 12
  },
  {
    businessName: "Elite Wedding Photography",
    category: "photographers",
    city: "Nashville", 
    zipcode: "37203",
    contact: {
      website: "www.eliteweddingphotography.com",
      phone: "(615) 555-0102"
    },
    rating: 4.9,
    tags: ["professional", "artistic", "candid", "portrait"],
    videoCount: 8
  },
  {
    businessName: "Harmony String Trio",
    category: "musicians",
    city: "Nashville",
    zipcode: "37205", 
    contact: {
      website: "www.harmonystringtrio.com",
      phone: "(615) 555-0103"
    },
    rating: 4.7,
    tags: ["strings", "classical", "elegant", "ceremony"],
    videoCount: 6
  },
  {
    businessName: "Memphis Grand Ballroom",
    category: "venues",
    city: "Memphis",
    zipcode: "38103",
    contact: {
      website: "www.memphisgrandballroom.com", 
      phone: "(901) 555-0201"
    },
    rating: 4.6,
    tags: ["indoor", "elegant", "ballroom", "historic"],
    videoCount: 15
  },
  {
    businessName: "Southern Belle Videographers", 
    category: "videographers",
    city: "Nashville",
    zipcode: "37212",
    contact: {
      website: "www.southernbellevideo.com",
      phone: "(615) 555-0104"
    },
    rating: 4.8,
    tags: ["cinematic", "storytelling", "drone", "professional"],
    videoCount: 20
  }
];

// Sample video data
const sampleVideos = [
  {
    title: "Scenic Outdoor Wedding - Drone Shot",
    filename: "social_u8756272651_drone_shot_of_scenic_outdoor_wedding._A_large_cro_286980f5-7942-44ec-a642-324c07ca2dc4_1.mp4",
    vendorId: "vendor_scenic_mountain", // Will be set to actual doc ID
    category: "venues",
    city: "Nashville", 
    zipcode: "37215",
    tags: ["outdoor", "scenic", "drone", "aerial", "mountains"],
    bunnyUrl: "https://vz-80cd40aa-6f0.b-cdn.net/venues_16x9/scenic_outdoor_wedding.mp4",
    description: "Aerial drone shot of a beautiful outdoor wedding ceremony"
  },
  {
    title: "String Trio Performance",
    filename: "social_u8756272651_side_shot_A_pianist_next_to_a_string_trio_at_a_sc_321cdbc2-9d8c-43dc-bb59-7bdba1312e3e_3.mp4", 
    vendorId: "vendor_harmony_strings", // Will be set to actual doc ID
    category: "musicians",
    city: "Nashville",
    zipcode: "37205",
    tags: ["strings", "trio", "classical", "ceremony"],
    bunnyUrl: "https://vz-aeaf110d-728.b-cdn.net/musicians_16x9/string_trio.mp4",
    description: "Elegant string trio performance during wedding ceremony"
  }
];

async function setupFirebaseData() {
  try {
    console.log('Setting up Firebase collections...');

    // Create vendors
    const vendorsRef = db.collection('vendors');
    const vendorIds = [];

    for (const vendor of sampleVendors) {
      const docRef = await vendorsRef.add({
        ...vendor,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      vendorIds.push(docRef.id);
      console.log(`Created vendor: ${vendor.businessName} (${docRef.id})`);
    }

    // Create videos with actual vendor IDs
    const videosRef = db.collection('videos');
    
    for (let i = 0; i < sampleVideos.length && i < vendorIds.length; i++) {
      const video = {
        ...sampleVideos[i],
        vendorId: vendorIds[i], // Link to actual vendor
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await videosRef.add(video);
      console.log(`Created video: ${video.title} (${docRef.id})`);
    }

    // Create a sample user
    const usersRef = db.collection('users');
    await usersRef.add({
      email: "test@example.com",
      zipcode: "37215",
      preferences: {
        categories: ["venues", "photographers"],
        budget: "medium"
      },
      searches: [],
      favorites: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Firebase data setup complete!');
    console.log(`Created ${vendorIds.length} vendors and ${sampleVideos.length} videos`);
    
  } catch (error) {
    console.error('Error setting up Firebase data:', error);
  }
}

// Run setup
setupFirebaseData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});