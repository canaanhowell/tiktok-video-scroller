#!/usr/bin/env node
// Upload real venue videos to 9x16 venues library
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_venues_9x16,
  key: process.env.bunny_cdn_video_streaming_key_venues_9x16,
  hostname: 'vz-97606b97-31d.b-cdn.net'
};

// Venue vendor data
const VENUE_VENDORS = [
  { name: 'Elegant Gardens', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
  { name: 'Royal Estate', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
  { name: 'Mountain View Manor', city: 'Gatlinburg', state: 'Tennessee', zipcode: '37738' },
  { name: 'Grand Ballroom', city: 'Memphis', state: 'Tennessee', zipcode: '38103' },
  { name: 'Rosewood Gardens', city: 'Franklin', state: 'Tennessee', zipcode: '37064' },
  { name: 'Crystal Palace', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' },
  { name: 'Sunset Terrace', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' },
  { name: 'Heritage Hall', city: 'Murfreesboro', state: 'Tennessee', zipcode: '37130' }
];

async function deleteExistingVideos() {
  console.log('🗑️  Cleaning up existing test pattern videos...\n');
  
  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY.id}/videos?page=1&itemsPerPage=100`,
    {
      headers: {
        'AccessKey': LIBRARY.key,
        'accept': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    for (const video of data.items || []) {
      console.log(`Deleting: ${video.title}`);
      await fetch(
        `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${video.guid}`,
        {
          method: 'DELETE',
          headers: {
            'AccessKey': LIBRARY.key
          }
        }
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('✅ Cleanup complete\n');
  }
}

async function createVideoWithMetadata(filename, vendorIndex) {
  const vendor = VENUE_VENDORS[vendorIndex % VENUE_VENDORS.length];
  const title = filename
    .replace(/\.mp4$/i, '')
    .replace(/social_u\d+_/g, '')
    .replace(/_/g, ' ')
    .trim() || `${vendor.name} Wedding Venue`;
  
  const metadata = {
    title,
    category: 'venues',
    vendorName: vendor.name,
    vendorWebsite: `www.${vendor.name.toLowerCase().replace(/\s+/g, '')}.com`,
    vendorCity: vendor.city,
    vendorState: vendor.state,
    vendorZipcode: vendor.zipcode
  };
  
  console.log(`\n📹 Creating: ${title}`);
  console.log(`   Vendor: ${vendor.name}, ${vendor.city}, ${vendor.state}`);
  
  try {
    // Create video entry
    const createResponse = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': LIBRARY.key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      }
    );
    
    if (!createResponse.ok) {
      console.log(`   ❌ Failed to create video: ${createResponse.status}`);
      return null;
    }
    
    const created = await createResponse.json();
    console.log(`   ✅ Created: ${created.guid}`);
    
    // Add metadata using moments
    const moments = [
      { label: `category:${metadata.category}`, timestamp: 0 },
      { label: `vendorName:${metadata.vendorName}`, timestamp: 0 },
      { label: `vendorWebsite:${metadata.vendorWebsite}`, timestamp: 0 },
      { label: `vendorCity:${metadata.vendorCity}`, timestamp: 0 },
      { label: `vendorState:${metadata.vendorState}`, timestamp: 0 },
      { label: `vendorZipcode:${metadata.vendorZipcode}`, timestamp: 0 }
    ];
    
    const updateResponse = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${created.guid}`,
      {
        method: 'POST',
        headers: {
          'AccessKey': LIBRARY.key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moments })
      }
    );
    
    if (updateResponse.ok) {
      console.log(`   ✅ Metadata added`);
    }
    
    return created.guid;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function uploadVideoFile(videoId, filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`   📤 Uploading ${Math.round(fileSize / 1024 / 1024)}MB...`);
    
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${videoId}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': LIBRARY.key,
          'Content-Type': 'video/mp4',
          'Content-Length': fileSize
        },
        body: fileStream,
        duplex: 'half'
      }
    );
    
    if (uploadResponse.ok) {
      console.log(`   ✅ Upload complete`);
      console.log(`   🔗 https://${LIBRARY.hostname}/${videoId}/playlist.m3u8`);
      return true;
    } else {
      console.log(`   ❌ Upload failed: ${uploadResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Upload error: ${error.message}`);
    return false;
  }
}

async function uploadVenueVideos() {
  console.log('🏛️  Uploading Venue Videos to 9x16 Library\n');
  console.log('=' .repeat(60));
  
  // First, clean up existing test pattern videos
  await deleteExistingVideos();
  
  // Find videos in input/venues/9x16
  const venuesDir = '/app/main/staging_app/input/venues/9x16';
  
  if (!fs.existsSync(venuesDir)) {
    console.log(`❌ Directory not found: ${venuesDir}`);
    console.log('\nLooking for venue videos in other locations...');
    
    // Try alternative paths
    const altPaths = [
      '/app/main/staging_app/input/venues',
      '/app/main/staging_app/input/output/ceremonies',
      '/app/main/staging_app/input'
    ];
    
    for (const altPath of altPaths) {
      if (fs.existsSync(altPath)) {
        console.log(`\n📁 Checking ${altPath}...`);
        const files = fs.readdirSync(altPath)
          .filter(f => f.endsWith('.mp4') && !f.includes('16x9'));
        
        if (files.length > 0) {
          console.log(`Found ${files.length} potential 9x16 videos`);
          // Use first alternative path with videos
          const videos = files.map(f => path.join(altPath, f));
          await uploadVideos(videos);
          return;
        }
      }
    }
    
    console.log('\n❌ No venue videos found!');
    return;
  }
  
  const videos = fs.readdirSync(venuesDir)
    .filter(f => f.endsWith('.mp4'))
    .map(f => path.join(venuesDir, f));
  
  console.log(`\n📊 Found ${videos.length} videos in ${venuesDir}\n`);
  
  if (videos.length === 0) {
    console.log('❌ No MP4 videos found!');
    return;
  }
  
  await uploadVideos(videos);
}

async function uploadVideos(videoPaths) {
  let uploaded = 0;
  let failed = 0;
  
  for (let i = 0; i < videoPaths.length; i++) {
    const videoPath = videoPaths[i];
    const filename = path.basename(videoPath);
    
    const videoId = await createVideoWithMetadata(filename, i);
    if (videoId) {
      const success = await uploadVideoFile(videoId, videoPath);
      if (success) {
        uploaded++;
      } else {
        failed++;
      }
    } else {
      failed++;
    }
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (uploaded > 0) {
    console.log('\n🎉 Success! Real venue videos uploaded.');
    console.log('The SMPTE test patterns should be replaced with actual content.');
    console.log('\n🔍 Test at: https://media.synthetikmedia.ai/venues');
  }
}

// Run the upload
uploadVenueVideos().catch(console.error);