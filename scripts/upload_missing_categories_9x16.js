#!/usr/bin/env node
// Upload to photographers and DJs 9x16 libraries with correct env var names
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  photography: { // Using 'photography' to match env var
    displayName: 'photographers',
    vendors: [
      { name: 'Golden Hour Photography', city: 'Nashville', state: 'Tennessee', zipcode: '37203' },
      { name: 'Captured Moments Studio', city: 'Franklin', state: 'Tennessee', zipcode: '37064' },
      { name: 'Lens & Light Photography', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
      { name: 'Picture Perfect Studios', city: 'Memphis', state: 'Tennessee', zipcode: '38103' }
    ]
  },
  dj: { // Using 'dj' to match env var
    displayName: 'djs',
    vendors: [
      { name: 'DJ Spectacular', city: 'Nashville', state: 'Tennessee', zipcode: '37219' },
      { name: 'Party Mix Masters', city: 'Memphis', state: 'Tennessee', zipcode: '38104' },
      { name: 'Beat Drop Entertainment', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' },
      { name: 'Sound Wave DJs', city: 'Murfreesboro', state: 'Tennessee', zipcode: '37130' }
    ]
  }
};

async function uploadToCategory(category) {
  const config = CATEGORIES[category];
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${category}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${category}_9x16`];
  
  console.log(`\n📁 Uploading to ${config.displayName.toUpperCase()}:`);
  console.log(`   Library ID: ${libraryId}`);
  
  // Find videos
  const videos = [];
  const inputDir = '/app/main/staging_app/input';
  if (fs.existsSync(inputDir)) {
    const files = fs.readdirSync(inputDir)
      .filter(f => f.endsWith('.mp4') && !f.includes('16x9'))
      .map(f => path.join(inputDir, f))
      .slice(0, 4);
    videos.push(...files);
  }
  
  // Try musicians directory as fallback
  const musiciansDir = '/app/main/staging_app/input/musicians';
  if (videos.length === 0 && fs.existsSync(musiciansDir)) {
    const files = fs.readdirSync(musiciansDir)
      .filter(f => f.endsWith('.mp4'))
      .map(f => path.join(musiciansDir, f))
      .slice(0, 4);
    videos.push(...files);
  }
  
  console.log(`   Found ${videos.length} videos\n`);
  
  let uploaded = 0;
  for (let i = 0; i < videos.length; i++) {
    const videoPath = videos[i];
    const vendor = config.vendors[i % config.vendors.length];
    const filename = path.basename(videoPath);
    const title = filename
      .replace(/\.mp4$/i, '')
      .replace(/social_u\d+_/g, '')
      .replace(/_/g, ' ')
      .trim() || `${vendor.name}`;
    
    console.log(`   📹 ${title}`);
    console.log(`      Vendor: ${vendor.name}`);
    
    try {
      // Create video
      const createResponse = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        {
          method: 'POST',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title })
        }
      );
      
      if (!createResponse.ok) {
        console.log(`      ❌ Failed to create: ${createResponse.status}`);
        continue;
      }
      
      const created = await createResponse.json();
      
      // Add metadata
      const moments = [
        { label: `category:${config.displayName}`, timestamp: 0 },
        { label: `vendorName:${vendor.name}`, timestamp: 0 },
        { label: `vendorWebsite:www.${vendor.name.toLowerCase().replace(/\s+/g, '')}.com`, timestamp: 0 },
        { label: `vendorCity:${vendor.city}`, timestamp: 0 },
        { label: `vendorState:${vendor.state}`, timestamp: 0 },
        { label: `vendorZipcode:${vendor.zipcode}`, timestamp: 0 }
      ];
      
      await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${created.guid}`,
        {
          method: 'POST',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ moments })
        }
      );
      
      // Upload file
      const fileStream = fs.createReadStream(videoPath);
      const fileSize = fs.statSync(videoPath).size;
      
      console.log(`      📤 Uploading ${Math.round(fileSize / 1024 / 1024)}MB...`);
      
      const uploadResponse = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${created.guid}`,
        {
          method: 'PUT',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'video/mp4',
            'Content-Length': fileSize
          },
          body: fileStream,
          duplex: 'half'
        }
      );
      
      if (uploadResponse.ok) {
        console.log(`      ✅ Success`);
        uploaded++;
      } else {
        console.log(`      ❌ Upload failed`);
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n   ✅ Uploaded ${uploaded} videos to ${config.displayName}`);
}

async function main() {
  console.log('🎬 Uploading to Photography and DJ 9x16 Libraries\n');
  console.log('=' .repeat(60));
  
  for (const category of Object.keys(CATEGORIES)) {
    await uploadToCategory(category);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n🎉 Done! Test at:');
  console.log('   https://media.synthetikmedia.ai/photographers');
  console.log('   https://media.synthetikmedia.ai/djs');
}

main().catch(console.error);