#!/usr/bin/env node
// Clean up category libraries - only upload if we have actual videos for that category
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

// Category to env var mapping
const CATEGORY_CONFIG = {
  venues: {
    envPrefix: 'venues',
    searchDirs: ['/app/main/staging_app/input/venues', '/app/main/staging_app/input/ceremonies'],
    keywords: ['venue', 'garden', 'ballroom', 'ceremony', 'reception'],
    vendors: [
      { name: 'Elegant Gardens', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Royal Estate', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
      { name: 'Mountain View Manor', city: 'Gatlinburg', state: 'Tennessee', zipcode: '37738' }
    ]
  },
  photographers: {
    envPrefix: 'photography',
    searchDirs: ['/app/main/staging_app/input/photographers', '/app/main/staging_app/input/photography'],
    keywords: ['photo', 'camera', 'portrait', 'photography'],
    vendors: [
      { name: 'Golden Hour Photography', city: 'Nashville', state: 'Tennessee', zipcode: '37203' },
      { name: 'Captured Moments Studio', city: 'Franklin', state: 'Tennessee', zipcode: '37064' }
    ]
  },
  videographers: {
    envPrefix: 'videographers',
    searchDirs: ['/app/main/staging_app/input/videographers', '/app/main/staging_app/input/videography'],
    keywords: ['video', 'film', 'cinema', 'videography'],
    vendors: [
      { name: 'Cinematic Weddings', city: 'Nashville', state: 'Tennessee', zipcode: '37211' },
      { name: 'Forever Films', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' }
    ]
  },
  musicians: {
    envPrefix: 'musicians',
    searchDirs: ['/app/main/staging_app/input/musicians', '/app/main/staging_app/input/music'],
    keywords: ['music', 'piano', 'string', 'cello', 'violin', 'band'],
    vendors: [
      { name: 'Nashville Strings', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Harmony Musicians', city: 'Memphis', state: 'Tennessee', zipcode: '38103' }
    ]
  },
  djs: {
    envPrefix: 'dj',
    searchDirs: ['/app/main/staging_app/input/djs', '/app/main/staging_app/input/dj'],
    keywords: ['dj', 'party', 'dance', 'mixing'],
    vendors: [
      { name: 'DJ Spectacular', city: 'Nashville', state: 'Tennessee', zipcode: '37219' },
      { name: 'Party Mix Masters', city: 'Memphis', state: 'Tennessee', zipcode: '38104' }
    ]
  }
};

// Find videos for a specific category
function findCategoryVideos(category) {
  const config = CATEGORY_CONFIG[category];
  const videos = [];
  
  // First check category-specific directories
  for (const dir of config.searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.mp4') && !f.includes('16x9'))
        .map(f => path.join(dir, f));
      videos.push(...files);
    }
  }
  
  // If no videos found in specific dirs, search staging_app input by keywords
  if (videos.length === 0) {
    const inputDir = '/app/main/staging_app/input';
    if (fs.existsSync(inputDir)) {
      const files = fs.readdirSync(inputDir)
        .filter(f => {
          if (!f.endsWith('.mp4') || f.includes('16x9')) return false;
          const lower = f.toLowerCase();
          return config.keywords.some(keyword => lower.includes(keyword));
        })
        .map(f => path.join(inputDir, f));
      videos.push(...files);
    }
  }
  
  // Remove duplicates
  return [...new Set(videos)];
}

// Truncate a library
async function truncateLibrary(category) {
  const config = CATEGORY_CONFIG[category];
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${config.envPrefix}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${config.envPrefix}_9x16`];
  
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
async function uploadCategoryVideos(category, videos) {
  const config = CATEGORY_CONFIG[category];
  const libraryId = process.env[`bunny_cdn_video_streaming_library_${config.envPrefix}_9x16`];
  const apiKey = process.env[`bunny_cdn_video_streaming_key_${config.envPrefix}_9x16`];
  
  console.log(`\n📤 Uploading ${videos.length} videos to ${category}...`);
  
  let uploaded = 0;
  for (let i = 0; i < videos.length; i++) {
    const videoPath = videos[i];
    const vendor = config.vendors[i % config.vendors.length];
    const filename = path.basename(videoPath);
    const title = filename
      .replace(/\.mp4$/i, '')
      .replace(/social_u\d+_/g, '')
      .replace(/_/g, ' ')
      .trim() || vendor.name;
    
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
  console.log('🧹 Cleaning Category Libraries - No Placeholders Policy\n');
  console.log('=' .repeat(60));
  console.log('\nOnly uploading videos if they exist for that specific category.');
  console.log('Empty input folders = empty libraries.\n');
  
  // First, find what videos we have
  console.log('🔍 Scanning for category-specific videos...\n');
  const summary = {};
  
  for (const category of Object.keys(CATEGORY_CONFIG)) {
    const videos = findCategoryVideos(category);
    summary[category] = videos.length;
    
    console.log(`${category}: ${videos.length} videos found`);
    if (videos.length > 0) {
      videos.slice(0, 3).forEach(v => {
        console.log(`   - ${path.basename(v)}`);
      });
      if (videos.length > 3) console.log(`   ... and ${videos.length - 3} more`);
    }
  }
  
  console.log('\n\n🔄 Processing libraries...');
  
  for (const category of Object.keys(CATEGORY_CONFIG)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📁 ${category.toUpperCase()}`);
    
    // Always truncate first
    await truncateLibrary(category);
    
    // Only upload if we have videos
    const videos = findCategoryVideos(category);
    if (videos.length > 0) {
      await uploadCategoryVideos(category, videos);
      console.log(`   ✅ Library populated with ${videos.length} videos`);
    } else {
      console.log(`   📭 Library left empty (no ${category} videos found)`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ All libraries cleaned!');
  console.log('\nSummary:');
  for (const [category, count] of Object.entries(summary)) {
    console.log(`   ${category}: ${count > 0 ? count + ' videos' : 'empty'}`);
  }
  
  console.log('\n📱 Categories with videos will display content.');
  console.log('📭 Categories without videos will show no content (as intended).');
}

main().catch(console.error);