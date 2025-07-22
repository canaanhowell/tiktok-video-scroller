#!/usr/bin/env node
// Truncate all 9x16 category libraries and upload fresh videos
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

// Category configurations
const CATEGORIES = {
  venues: {
    vendors: [
      { name: 'Elegant Gardens', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Royal Estate', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
      { name: 'Mountain View Manor', city: 'Gatlinburg', state: 'Tennessee', zipcode: '37738' },
      { name: 'Grand Ballroom', city: 'Memphis', state: 'Tennessee', zipcode: '38103' }
    ],
    searchDirs: ['/app/main/staging_app/input/venues', '/app/main/staging_app/input/output/ceremonies']
  },
  photographers: {
    vendors: [
      { name: 'Golden Hour Photography', city: 'Nashville', state: 'Tennessee', zipcode: '37203' },
      { name: 'Captured Moments Studio', city: 'Franklin', state: 'Tennessee', zipcode: '37064' },
      { name: 'Lens & Light Photography', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
      { name: 'Picture Perfect Studios', city: 'Memphis', state: 'Tennessee', zipcode: '38103' }
    ],
    searchDirs: ['/app/main/staging_app/input/photographers']
  },
  videographers: {
    vendors: [
      { name: 'Cinematic Weddings', city: 'Nashville', state: 'Tennessee', zipcode: '37211' },
      { name: 'Forever Films', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' },
      { name: 'Motion Picture Memories', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' },
      { name: 'Reel Love Productions', city: 'Franklin', state: 'Tennessee', zipcode: '37064' }
    ],
    searchDirs: ['/app/main/staging_app/input/videographers']
  },
  musicians: {
    vendors: [
      { name: 'Nashville Strings', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Harmony Musicians', city: 'Memphis', state: 'Tennessee', zipcode: '38103' },
      { name: 'The Music Masters', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' },
      { name: 'Melody Makers', city: 'Franklin', state: 'Tennessee', zipcode: '37064' }
    ],
    searchDirs: ['/app/main/staging_app/input/musicians']
  },
  djs: {
    vendors: [
      { name: 'DJ Spectacular', city: 'Nashville', state: 'Tennessee', zipcode: '37219' },
      { name: 'Party Mix Masters', city: 'Memphis', state: 'Tennessee', zipcode: '38104' },
      { name: 'Beat Drop Entertainment', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' },
      { name: 'Sound Wave DJs', city: 'Murfreesboro', state: 'Tennessee', zipcode: '37130' }
    ],
    searchDirs: ['/app/main/staging_app/input/djs']
  }
};

async function truncateLibrary(category) {
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${category}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${category}_9x16`];
  
  console.log(`\n🗑️  Truncating ${category} 9x16 library...`);
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100`,
      {
        headers: {
          'AccessKey': apiKey,
          'accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const videos = data.items || [];
      
      for (const video of videos) {
        await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${video.guid}`,
          {
            method: 'DELETE',
            headers: { 'AccessKey': apiKey }
          }
        );
        console.log(`   Deleted: ${video.title}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`   ✅ Truncated ${videos.length} videos`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function findVideosForCategory(category) {
  const config = CATEGORIES[category];
  const videos = [];
  
  // First, look for category-specific directories
  for (const dir of config.searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.mp4') && !f.includes('16x9'))
        .map(f => path.join(dir, f));
      videos.push(...files);
    }
  }
  
  // If no videos found, search in general input directory
  if (videos.length === 0) {
    const generalDir = '/app/main/staging_app/input';
    if (fs.existsSync(generalDir)) {
      const files = fs.readdirSync(generalDir)
        .filter(f => {
          const lower = f.toLowerCase();
          return f.endsWith('.mp4') && 
                 !f.includes('16x9') &&
                 (lower.includes(category.slice(0, -1)) || // singular form
                  lower.includes(category));
        })
        .map(f => path.join(generalDir, f))
        .slice(0, 4); // Take up to 4 videos
      videos.push(...files);
    }
  }
  
  // If still no videos, take any 9x16 videos
  if (videos.length === 0) {
    const dirs = ['/app/main/staging_app/input/musicians', '/app/main/staging_app/input', '/app/main/staging_app/input/output'];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .filter(f => f.endsWith('.mp4') && !f.includes('16x9'))
          .map(f => path.join(dir, f))
          .slice(0, 4);
        if (files.length > 0) {
          videos.push(...files);
          break;
        }
      }
    }
  }
  
  return videos;
}

async function uploadVideoToCategory(videoPath, category, vendorIndex) {
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${category}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${category}_9x16`];
  const config = CATEGORIES[category];
  const vendor = config.vendors[vendorIndex % config.vendors.length];
  
  const filename = path.basename(videoPath);
  const title = filename
    .replace(/\.mp4$/i, '')
    .replace(/social_u\d+_/g, '')
    .replace(/_/g, ' ')
    .trim() || `${vendor.name} ${category}`;
  
  console.log(`\n   📹 ${title}`);
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
      console.log(`      ❌ Failed to create`);
      return false;
    }
    
    const created = await createResponse.json();
    
    // Add metadata
    const moments = [
      { label: `category:${category}`, timestamp: 0 },
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
      return true;
    } else {
      console.log(`      ❌ Upload failed`);
      return false;
    }
  } catch (error) {
    console.log(`      ❌ Error: ${error.message}`);
    return false;
  }
}

async function processAllCategories() {
  console.log('🎬 Truncating and Uploading Fresh Videos to All 9x16 Category Libraries\n');
  console.log('=' .repeat(60));
  
  for (const category of Object.keys(CATEGORIES)) {
    console.log(`\n📁 Processing ${category.toUpperCase()}:`);
    
    // Truncate library
    await truncateLibrary(category);
    
    // Find videos
    const videos = await findVideosForCategory(category);
    console.log(`\n📊 Found ${videos.length} videos to upload`);
    
    if (videos.length === 0) {
      console.log('   ⚠️  No videos found for this category');
      continue;
    }
    
    // Upload videos
    let uploaded = 0;
    for (let i = 0; i < Math.min(videos.length, 4); i++) {
      const success = await uploadVideoToCategory(videos[i], category, i);
      if (success) uploaded++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n   ✅ Uploaded ${uploaded} videos to ${category}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n🎉 All categories processed!');
  console.log('\n📱 Test each category on mobile:');
  console.log('   https://media.synthetikmedia.ai/venues');
  console.log('   https://media.synthetikmedia.ai/photographers');
  console.log('   https://media.synthetikmedia.ai/videographers');
  console.log('   https://media.synthetikmedia.ai/musicians');
  console.log('   https://media.synthetikmedia.ai/djs');
}

// Run the process
processAllCategories().catch(console.error);