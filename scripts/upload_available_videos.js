#!/usr/bin/env node
// Upload available videos from input directory with metadata
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main libraries configuration
const MAIN_LIBRARIES = {
  '16x9': {
    id: process.env.bunny_cdn_video_streaming_library_16x9,
    key: process.env.bunny_cdn_video_streaming_key_16x9,
    hostname: 'vz-97606b97-31d.b-cdn.net'
  },
  '9x16': {
    id: process.env.bunny_cdn_video_streaming_library_9x16,
    key: process.env.bunny_cdn_video_streaming_key_9x16,
    hostname: 'vz-97606b97-2f3.b-cdn.net'
  }
};

// Sample vendor data for different categories
const VENDOR_DATA = {
  musicians: [
    { name: 'Nashville Strings', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
    { name: 'Harmony Musicians', city: 'Memphis', state: 'Tennessee', zipcode: '38103' },
    { name: 'The Music Masters', city: 'Knoxville', state: 'Tennessee', zipcode: '37902' },
    { name: 'Blissful Melodies', city: 'Franklin', state: 'Tennessee', zipcode: '37064' }
  ],
  ceremonies: [
    { name: 'Sacred Ceremonies Co', city: 'Nashville', state: 'Tennessee', zipcode: '37205' },
    { name: 'Wedding Officiants Plus', city: 'Brentwood', state: 'Tennessee', zipcode: '37027' }
  ],
  venues: [
    { name: 'Elegant Venues', city: 'Nashville', state: 'Tennessee', zipcode: '37215' },
    { name: 'Royal Gardens', city: 'Franklin', state: 'Tennessee', zipcode: '37064' },
    { name: 'Mountain View Manor', city: 'Gatlinburg', state: 'Tennessee', zipcode: '37738' }
  ],
  photographers: [
    { name: 'Golden Hour Photography', city: 'Nashville', state: 'Tennessee', zipcode: '37203' },
    { name: 'Captured Moments', city: 'Murfreesboro', state: 'Tennessee', zipcode: '37130' }
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

// Find available video files
function findVideoFiles() {
  console.log('🔍 Searching for video files...\n');
  
  const videos = [];
  const inputDir = '/app/main/staging_app/input';
  
  // Search in each category directory
  const categories = ['musicians', 'ceremonies', 'venues', 'photographers', 'videographers', 'djs'];
  
  categories.forEach(category => {
    const categoryPath = path.join(inputDir, category);
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath)
        .filter(f => f.endsWith('.mp4'))
        .slice(0, 2); // Take up to 2 videos per category
      
      files.forEach((file, index) => {
        const vendorList = VENDOR_DATA[category] || VENDOR_DATA.musicians;
        const vendor = vendorList[index % vendorList.length];
        
        videos.push({
          path: path.join(categoryPath, file),
          filename: file,
          category: category === 'ceremonies' ? 'venues' : category, // Map ceremonies to venues
          title: file.replace(/social_u\d+_/, '').replace(/_/g, ' ').replace('.mp4', '').trim(),
          vendor: vendor.name,
          city: vendor.city,
          state: vendor.state,
          zipcode: vendor.zipcode,
          // Guess resolution from filename or default to 16x9
          resolution: file.includes('9x16') || file.includes('9_16') ? '9x16' : '16x9'
        });
      });
    }
  });
  
  // Also check output directory
  const outputDir = path.join(inputDir, 'output');
  if (fs.existsSync(outputDir)) {
    const subdirs = fs.readdirSync(outputDir);
    subdirs.forEach(subdir => {
      const subdirPath = path.join(outputDir, subdir);
      if (fs.statSync(subdirPath).isDirectory()) {
        const files = fs.readdirSync(subdirPath)
          .filter(f => f.endsWith('.mp4'))
          .slice(0, 1); // Take 1 video per subdirectory
        
        files.forEach(file => {
          const category = subdir === 'ceremonies' ? 'venues' : subdir;
          const vendorList = VENDOR_DATA[category] || VENDOR_DATA.venues;
          const vendor = vendorList[0];
          
          videos.push({
            path: path.join(subdirPath, file),
            filename: file,
            category,
            title: file.replace(/social_u\d+_/, '').replace(/_/g, ' ').replace('.mp4', '').trim(),
            vendor: vendor.name,
            city: vendor.city,
            state: vendor.state,
            zipcode: vendor.zipcode,
            resolution: '16x9'
          });
        });
      }
    });
  }
  
  return videos;
}

async function createVideoWithMetadata(libraryId, apiKey, videoData) {
  try {
    const createUrl = `https://video.bunnycdn.com/library/${libraryId}/videos`;
    
    // Create video entry
    const createPayload = {
      title: videoData.title
    };
    
    console.log(`  📝 Creating: "${videoData.title}"`);
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.log(`  ❌ Failed: ${error.substring(0, 100)}`);
      return null;
    }
    
    const createdVideo = await createResponse.json();
    const videoId = createdVideo.guid;
    console.log(`  ✅ Created: ${videoId}`);
    
    // Add metadata
    const metadata = {
      category: videoData.category,
      vendorName: videoData.vendor,
      vendorWebsite: `www.${videoData.vendor.toLowerCase().replace(/\s+/g, '')}.com`,
      vendorCity: videoData.city,
      vendorState: videoData.state,
      vendorZipcode: videoData.zipcode
    };
    
    console.log(`  🏷️  Metadata:`, JSON.stringify(metadata));
    
    // Try to update metadata using POST
    const updateUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ metaTags: metadata })
    });
    
    if (!updateResponse.ok) {
      console.log(`  ⚠️  Metadata update status: ${updateResponse.status}`);
    }
    
    return videoId;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function uploadVideoFile(libraryId, apiKey, videoId, filePath) {
  try {
    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`  📤 Uploading ${Math.round(fileSize / 1024 / 1024)}MB...`);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'video/mp4',
        'Content-Length': fileSize
      },
      body: fileStream,
      duplex: 'half'
    });
    
    if (uploadResponse.ok) {
      console.log(`  ✅ Uploaded!`);
      return true;
    } else {
      console.log(`  ❌ Upload failed: ${uploadResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function uploadAvailableVideos() {
  console.log('🎬 Uploading Available Videos to Main Libraries\n');
  console.log('=' .repeat(60) + '\n');
  
  const videos = findVideoFiles();
  
  if (videos.length === 0) {
    console.log('❌ No video files found!');
    return;
  }
  
  console.log(`📊 Found ${videos.length} videos:`);
  const byCategory = {};
  videos.forEach(v => {
    byCategory[v.category] = (byCategory[v.category] || 0) + 1;
  });
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} videos`);
  });
  console.log('');
  
  // Separate by resolution
  const videos16x9 = videos.filter(v => v.resolution === '16x9');
  const videos9x16 = videos.filter(v => v.resolution === '9x16');
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  // Upload to 16x9 library
  if (videos16x9.length > 0) {
    console.log(`\n📁 Uploading to 16x9 Library:`);
    console.log('-'.repeat(50));
    
    for (const video of videos16x9.slice(0, 10)) { // Limit to 10 videos
      console.log(`\n🎥 [${video.category.toUpperCase()}] ${video.filename}:`);
      
      const videoId = await createVideoWithMetadata(
        MAIN_LIBRARIES['16x9'].id,
        MAIN_LIBRARIES['16x9'].key,
        video
      );
      
      if (videoId) {
        const uploaded = await uploadVideoFile(
          MAIN_LIBRARIES['16x9'].id,
          MAIN_LIBRARIES['16x9'].key,
          videoId,
          video.path
        );
        
        if (uploaded) {
          totalUploaded++;
          const url = `https://${MAIN_LIBRARIES['16x9'].hostname}/${videoId}/playlist.m3u8`;
          console.log(`  🔗 URL: ${url}`);
        } else {
          totalFailed++;
        }
      } else {
        totalFailed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Upload to 9x16 library
  if (videos9x16.length > 0) {
    console.log(`\n📁 Uploading to 9x16 Library:`);
    console.log('-'.repeat(50));
    
    for (const video of videos9x16.slice(0, 10)) { // Limit to 10 videos
      console.log(`\n🎥 [${video.category.toUpperCase()}] ${video.filename}:`);
      
      const videoId = await createVideoWithMetadata(
        MAIN_LIBRARIES['9x16'].id,
        MAIN_LIBRARIES['9x16'].key,
        video
      );
      
      if (videoId) {
        const uploaded = await uploadVideoFile(
          MAIN_LIBRARIES['9x16'].id,
          MAIN_LIBRARIES['9x16'].key,
          videoId,
          video.path
        );
        
        if (uploaded) {
          totalUploaded++;
          const url = `https://${MAIN_LIBRARIES['9x16'].hostname}/${videoId}/playlist.m3u8`;
          console.log(`  🔗 URL: ${url}`);
        } else {
          totalFailed++;
        }
      } else {
        totalFailed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`✅ Successfully uploaded: ${totalUploaded}`);
  console.log(`❌ Failed: ${totalFailed}`);
  
  if (totalUploaded > 0) {
    console.log('\n✨ Videos uploaded with metadata!');
    console.log('Categories should now display correctly.');
    console.log('\n🔍 Test at: https://media.synthetikmedia.ai');
    console.log('\n⏱️  Wait 2-3 minutes for Bunny CDN processing');
  }
}

// Run the upload
uploadAvailableVideos().catch(console.error);