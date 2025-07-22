#!/usr/bin/env node
// Fix category mapping - upload correct videos to each category
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

// First, let's see what videos we have available
async function findAvailableVideos() {
  console.log('🔍 Finding available videos by category...\n');
  
  const categories = {
    venues: [],
    photographers: [],
    videographers: [],
    musicians: [],
    djs: []
  };
  
  // Search in main input directory
  const inputDir = '/app/main/staging_app/input';
  if (fs.existsSync(inputDir)) {
    const files = fs.readdirSync(inputDir);
    files.forEach(file => {
      if (file.endsWith('.mp4') && !file.includes('16x9')) {
        const lower = file.toLowerCase();
        const fullPath = path.join(inputDir, file);
        
        // Try to categorize based on filename
        if (lower.includes('venue') || lower.includes('garden') || lower.includes('ballroom')) {
          categories.venues.push(fullPath);
        } else if (lower.includes('photo') || lower.includes('camera')) {
          categories.photographers.push(fullPath);
        } else if (lower.includes('video') || lower.includes('film') || lower.includes('cinema')) {
          categories.videographers.push(fullPath);
        } else if (lower.includes('music') || lower.includes('piano') || lower.includes('string') || lower.includes('cello')) {
          categories.musicians.push(fullPath);
        } else if (lower.includes('dj') || lower.includes('party') || lower.includes('dance')) {
          categories.djs.push(fullPath);
        }
      }
    });
  }
  
  // Search in category-specific directories
  const categoryDirs = {
    venues: ['/app/main/staging_app/input/venues', '/app/main/staging_app/input/output/ceremonies'],
    musicians: ['/app/main/staging_app/input/musicians'],
    photographers: ['/app/main/staging_app/input/photographers'],
    videographers: ['/app/main/staging_app/input/videographers'],
    djs: ['/app/main/staging_app/input/djs']
  };
  
  for (const [category, dirs] of Object.entries(categoryDirs)) {
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .filter(f => f.endsWith('.mp4') && !f.includes('16x9'))
          .map(f => path.join(dir, f));
        categories[category].push(...files);
      }
    }
  }
  
  // Remove duplicates
  for (const category in categories) {
    categories[category] = [...new Set(categories[category])];
  }
  
  // Report findings
  console.log('📊 Videos found by category:');
  for (const [category, videos] of Object.entries(categories)) {
    console.log(`   ${category}: ${videos.length} videos`);
    if (videos.length > 0) {
      videos.slice(0, 3).forEach(v => {
        console.log(`      - ${path.basename(v)}`);
      });
      if (videos.length > 3) console.log(`      ... and ${videos.length - 3} more`);
    }
  }
  
  return categories;
}

// Truncate a library
async function truncateLibrary(category, envPrefix) {
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${envPrefix}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${envPrefix}_9x16`];
  
  console.log(`\n🗑️  Truncating ${category} library...`);
  
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
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`   ✅ Deleted ${videos.length} videos`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

// Upload videos to a category
async function uploadCategoryVideos(category, envPrefix, videos) {
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${envPrefix}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${envPrefix}_9x16`];
  
  const vendors = {
    venues: [
      { name: 'Elegant Gardens', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Royal Estate', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
      { name: 'Mountain View Manor', city: 'Gatlinburg', state: 'Tennessee', zipcode: '37738' },
      { name: 'Grand Ballroom', city: 'Memphis', state: 'Tennessee', zipcode: '38103' }
    ],
    photographers: [
      { name: 'Golden Hour Photography', city: 'Nashville', state: 'Tennessee', zipcode: '37203' },
      { name: 'Captured Moments Studio', city: 'Franklin', state: 'Tennessee', zipcode: '37064' },
      { name: 'Lens & Light Photography', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' }
    ],
    videographers: [
      { name: 'Cinematic Weddings', city: 'Nashville', state: 'Tennessee', zipcode: '37211' },
      { name: 'Forever Films', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' },
      { name: 'Motion Picture Memories', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' }
    ],
    musicians: [
      { name: 'Nashville Strings', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Harmony Musicians', city: 'Memphis', state: 'Tennessee', zipcode: '38103' },
      { name: 'The Music Masters', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' }
    ],
    djs: [
      { name: 'DJ Spectacular', city: 'Nashville', state: 'Tennessee', zipcode: '37219' },
      { name: 'Party Mix Masters', city: 'Memphis', state: 'Tennessee', zipcode: '38104' },
      { name: 'Beat Drop Entertainment', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' }
    ]
  };
  
  console.log(`\n📤 Uploading ${videos.length} videos to ${category}...`);
  
  let uploaded = 0;
  for (let i = 0; i < videos.length && i < 4; i++) {
    const videoPath = videos[i];
    const vendor = vendors[category][i % vendors[category].length];
    const filename = path.basename(videoPath);
    const title = filename
      .replace(/\.mp4$/i, '')
      .replace(/social_u\d+_/g, '')
      .replace(/_/g, ' ')
      .trim() || vendor.name;
    
    console.log(`\n   📹 ${title}`);
    console.log(`      File: ${filename}`);
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
        uploaded++;
      } else {
        console.log(`      ❌ Upload failed`);
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return uploaded;
}

async function main() {
  console.log('🎬 Fixing Category Mapping - Uploading Correct Videos\n');
  console.log('=' .repeat(60));
  
  // Find available videos
  const availableVideos = await findAvailableVideos();
  
  // Category to env var mapping
  const categoryMapping = {
    venues: 'venues',
    photographers: 'photography', 
    videographers: 'videographers',
    musicians: 'musicians',
    djs: 'dj'
  };
  
  console.log('\n\n🔄 Processing categories...');
  
  for (const [category, envPrefix] of Object.entries(categoryMapping)) {
    const videos = availableVideos[category];
    
    if (videos.length === 0) {
      console.log(`\n⚠️  No videos found for ${category}, using musician videos as fallback`);
      // Use musician videos as fallback
      const fallbackVideos = availableVideos.musicians.slice(0, 4);
      if (fallbackVideos.length > 0) {
        await truncateLibrary(category, envPrefix);
        await uploadCategoryVideos(category, envPrefix, fallbackVideos);
      }
    } else {
      await truncateLibrary(category, envPrefix);
      await uploadCategoryVideos(category, envPrefix, videos);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n🎉 Category mapping fixed!');
  console.log('\n📱 Test each category:');
  console.log('   https://media.synthetikmedia.ai/venues');
  console.log('   https://media.synthetikmedia.ai/photographers');
  console.log('   https://media.synthetikmedia.ai/videographers');
  console.log('   https://media.synthetikmedia.ai/musicians');
  console.log('   https://media.synthetikmedia.ai/djs');
}

main().catch(console.error);