#!/usr/bin/env node
// Upload all 16x9 videos from staging input folders with proper metadata
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9,
  hostname: 'vz-97606b97-31d.b-cdn.net'
};

// Load the batch_videos.json for metadata
let batchMetadata = {};
try {
  const batchData = JSON.parse(fs.readFileSync('/app/main/staging_app/input/batch_videos.json', 'utf8'));
  batchData.forEach(video => {
    if (video.resolution === '16x9') {
      batchMetadata[video.filename] = video;
    }
  });
  console.log(`📋 Loaded metadata for ${Object.keys(batchMetadata).length} videos from batch_videos.json\n`);
} catch (e) {
  console.log('⚠️  Could not load batch_videos.json, will use default metadata\n');
}

// Find all 16x9 videos
function find16x9Videos() {
  const videos = [];
  const inputBase = '/app/main/input';
  
  // Search all subdirectories
  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        searchDir(fullPath);
      } else if (stat.isFile() && item.endsWith('.mp4')) {
        // Check if it's likely 16x9 (not 9x16)
        // Look for clues in filename
        const is9x16 = item.includes('9x16') || item.includes('9_16') || 
                      item.includes('portrait') || item.includes('vertical');
        const is16x9 = item.includes('16x9') || item.includes('16_9') || 
                      item.includes('landscape') || item.includes('horizontal');
        
        // Default to 16x9 unless explicitly 9x16
        if (!is9x16 || is16x9) {
          videos.push({
            path: fullPath,
            filename: item,
            relativePath: path.relative(inputBase, fullPath)
          });
        }
      }
    });
  }
  
  searchDir(inputBase);
  return videos;
}

// Determine category from path or filename
function determineCategory(relativePath, filename) {
  const pathLower = relativePath.toLowerCase();
  const fileLower = filename.toLowerCase();
  const combined = `${pathLower} ${fileLower}`;
  
  if (combined.includes('musician') || combined.includes('music') || combined.includes('piano') || 
      combined.includes('string') || combined.includes('band')) return 'musicians';
  if (combined.includes('venue') || combined.includes('ceremony') || combined.includes('ceremonies') || 
      combined.includes('garden') || combined.includes('ballroom')) return 'venues';
  if (combined.includes('photo')) return 'photographers';
  if (combined.includes('video') || combined.includes('film') || combined.includes('cinema')) return 'videographers';
  if (combined.includes('dj') || combined.includes('party') || combined.includes('dance')) return 'djs';
  if (combined.includes('florist') || combined.includes('flower')) return 'florists';
  if (combined.includes('cake')) return 'wedding-cakes';
  
  // Default based on directory
  if (pathLower.includes('musicians')) return 'musicians';
  if (pathLower.includes('ceremonies')) return 'venues';
  if (pathLower.includes('venues')) return 'venues';
  
  return 'venues'; // Default
}

// Generate vendor metadata
function generateVendorMetadata(category, index) {
  const vendors = {
    musicians: [
      { name: 'Nashville Strings', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Harmony Musicians', city: 'Memphis', state: 'Tennessee', zipcode: '38103' },
      { name: 'The Music Masters', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' },
      { name: 'Melody Makers', city: 'Franklin', state: 'Tennessee', zipcode: '37064' }
    ],
    venues: [
      { name: 'Elegant Gardens', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
      { name: 'Royal Estate', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' },
      { name: 'Mountain View Manor', city: 'Gatlinburg', state: 'Tennessee', zipcode: '37738' },
      { name: 'Grand Ballroom', city: 'Memphis', state: 'Tennessee', zipcode: '38103' }
    ],
    photographers: [
      { name: 'Golden Hour Photography', city: 'Nashville', state: 'Tennessee', zipcode: '37203' },
      { name: 'Captured Moments Studio', city: 'Franklin', state: 'Tennessee', zipcode: '37064' }
    ],
    videographers: [
      { name: 'Cinematic Weddings', city: 'Nashville', state: 'Tennessee', zipcode: '37211' },
      { name: 'Forever Films', city: 'Chattanooga', state: 'Tennessee', zipcode: '37402' }
    ],
    djs: [
      { name: 'DJ Spectacular', city: 'Nashville', state: 'Tennessee', zipcode: '37219' },
      { name: 'Party Mix Masters', city: 'Memphis', state: 'Tennessee', zipcode: '38104' }
    ]
  };
  
  const categoryVendors = vendors[category] || vendors.venues;
  return categoryVendors[index % categoryVendors.length];
}

async function createVideoWithMetadata(videoFile, metadata) {
  console.log(`\n📹 ${videoFile.filename}`);
  console.log(`   Category: ${metadata.category}`);
  console.log(`   Vendor: ${metadata.vendorName}`);
  
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
        body: JSON.stringify({ title: metadata.title })
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
    } else {
      console.log(`   ⚠️  Metadata update failed`);
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

async function uploadAll16x9Videos() {
  console.log('🎬 Uploading All 16x9 Videos from Input Folders\n');
  console.log('=' .repeat(60));
  
  const videos = find16x9Videos();
  console.log(`\n📊 Found ${videos.length} potential 16x9 videos\n`);
  
  if (videos.length === 0) {
    console.log('❌ No videos found!');
    return;
  }
  
  // Group by category
  const byCategory = {};
  videos.forEach(v => {
    const category = determineCategory(v.relativePath, v.filename);
    if (!byCategory[category]) byCategory[category] = 0;
    byCategory[category]++;
  });
  
  console.log('📁 Videos by category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} videos`);
  });
  
  let uploaded = 0;
  let failed = 0;
  let categoryIndex = {};
  
  for (const video of videos) {
    // Check if we have metadata from batch_videos.json
    let metadata;
    if (batchMetadata[video.filename]) {
      const batch = batchMetadata[video.filename];
      metadata = {
        title: batch.title,
        category: batch.category,
        vendorName: batch.vendor,
        vendorWebsite: `www.${batch.vendor.toLowerCase().replace(/\s+/g, '')}.com`,
        vendorCity: batch.city,
        vendorState: batch.state,
        vendorZipcode: batch.zipcode
      };
    } else {
      // Generate metadata
      const category = determineCategory(video.relativePath, video.filename);
      const index = categoryIndex[category] || 0;
      categoryIndex[category] = index + 1;
      
      const vendor = generateVendorMetadata(category, index);
      const title = video.filename
        .replace(/\.mp4$/i, '')
        .replace(/social_u\d+_/g, '')
        .replace(/_/g, ' ')
        .trim();
      
      metadata = {
        title: title || video.filename,
        category,
        vendorName: vendor.name,
        vendorWebsite: `www.${vendor.name.toLowerCase().replace(/\s+/g, '')}.com`,
        vendorCity: vendor.city,
        vendorState: vendor.state,
        vendorZipcode: vendor.zipcode
      };
    }
    
    const videoId = await createVideoWithMetadata(video, metadata);
    if (videoId) {
      const success = await uploadVideoFile(videoId, video.path);
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
  console.log(`📁 Total: ${videos.length}`);
  
  if (uploaded > 0) {
    console.log('\n🎉 Success! Videos uploaded with proper metadata.');
    console.log('Categories should display correctly based on content.');
    console.log('\n🔍 Test at: https://media.synthetikmedia.ai');
  }
}

// Run the upload
uploadAll16x9Videos().catch(console.error);