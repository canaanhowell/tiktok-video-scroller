#!/usr/bin/env node
// Upload videos to Bunny CDN with proper metadata
require('dotenv').config({ path: '/app/main/web_app/.env' });
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Load batch videos JSON
const batchFile = '/app/main/staging_app/input/batch_videos.json';
const videos = JSON.parse(fs.readFileSync(batchFile, 'utf8'));

// Build library configurations from environment
const LIBRARIES = {};
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('bunny_cdn_video_streaming_library_') && !key.includes('_api_key')) {
    const libraryName = key.replace('bunny_cdn_video_streaming_library_', '');
    LIBRARIES[libraryName] = { id: value, key: null };
  }
});

Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('bunny_cdn_video_streaming_key_')) {
    const keyName = key.replace('bunny_cdn_video_streaming_key_', '');
    if (LIBRARIES[keyName]) {
      LIBRARIES[keyName].key = value;
    }
  }
});

async function createVideoInBunny(libraryId, apiKey, videoData) {
  try {
    // Step 1: Create video entry with metadata
    const createUrl = `https://video.bunnycdn.com/library/${libraryId}/videos`;
    
    // Prepare metadata - Bunny expects these as individual fields
    const createPayload = {
      title: videoData.title,
      // Try to set metaTags during creation
      metaTags: {
        category: videoData.category,
        vendorName: videoData.vendor,
        vendorWebsite: `www.${videoData.vendor.toLowerCase().replace(/\s+/g, '')}.com`,
        vendorCity: videoData.city,
        vendorState: videoData.state,
        vendorZipcode: videoData.zipcode,
        description: videoData.description
      }
    };
    
    console.log(`  📝 Creating video with metadata:`, JSON.stringify(createPayload.metaTags, null, 2));
    
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
      console.log(`  ❌ Failed to create video: ${createResponse.status} - ${error}`);
      return null;
    }
    
    const createdVideo = await createResponse.json();
    console.log(`  ✅ Created video: ${createdVideo.guid}`);
    
    // Step 2: Check if metadata was saved
    const checkUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${createdVideo.guid}`;
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'AccessKey': apiKey,
        'accept': 'application/json'
      }
    });
    
    if (checkResponse.ok) {
      const videoDetails = await checkResponse.json();
      console.log(`  🔍 Checking saved metadata:`, JSON.stringify(videoDetails.metaTags || {}, null, 2));
      
      // If metaTags weren't saved during creation, try updating
      if (!videoDetails.metaTags || Object.keys(videoDetails.metaTags).length === 0) {
        console.log(`  ⚠️  Metadata not saved during creation, attempting update...`);
        
        // Try different update methods
        const updateMethods = [
          // Method 1: Update with metaTags object
          {
            method: 'POST',
            body: { metaTags: createPayload.metaTags }
          },
          // Method 2: Update with individual fields
          {
            method: 'POST',
            body: createPayload.metaTags
          },
          // Method 3: PUT with metaTags
          {
            method: 'PUT',
            body: { metaTags: createPayload.metaTags }
          }
        ];
        
        for (const [index, update] of updateMethods.entries()) {
          console.log(`  🔄 Trying update method ${index + 1}...`);
          const updateResponse = await fetch(checkUrl, {
            method: update.method,
            headers: {
              'AccessKey': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(update.body)
          });
          
          if (updateResponse.ok) {
            console.log(`  ✅ Update method ${index + 1} succeeded!`);
            break;
          } else {
            const error = await updateResponse.text();
            console.log(`  ❌ Update method ${index + 1} failed: ${error.substring(0, 100)}`);
          }
        }
      }
    }
    
    return createdVideo.guid;
  } catch (error) {
    console.log(`  ❌ Error creating video: ${error.message}`);
    return null;
  }
}

async function uploadVideoFile(libraryId, apiKey, videoId, filePath) {
  try {
    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`  📤 Uploading ${Math.round(fileSize / 1024 / 1024)}MB file...`);
    
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
      console.log(`  ✅ Upload successful!`);
      return true;
    } else {
      const error = await uploadResponse.text();
      console.log(`  ❌ Upload failed: ${uploadResponse.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Upload error: ${error.message}`);
    return false;
  }
}

async function uploadVideosWithMetadata() {
  console.log('🎬 Bunny CDN Video Upload with Metadata\n');
  console.log('=' .repeat(60) + '\n');
  
  // Group videos by category and resolution
  const videosByLibrary = {};
  videos.forEach(video => {
    const libraryKey = `${video.category}_${video.resolution}`;
    if (!videosByLibrary[libraryKey]) {
      videosByLibrary[libraryKey] = [];
    }
    videosByLibrary[libraryKey].push(video);
  });
  
  console.log(`📊 Found ${videos.length} videos to upload:`);
  Object.entries(videosByLibrary).forEach(([lib, vids]) => {
    console.log(`   ${lib}: ${vids.length} videos`);
  });
  console.log('');
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  // Process each library
  for (const [libraryKey, libraryVideos] of Object.entries(videosByLibrary)) {
    const library = LIBRARIES[libraryKey];
    
    if (!library || !library.id || !library.key) {
      console.log(`\n⚠️  Skipping ${libraryKey} - library not configured`);
      totalFailed += libraryVideos.length;
      continue;
    }
    
    console.log(`\n📁 Processing ${libraryKey} (Library: ${library.id}):`);
    console.log('-'.repeat(50));
    
    for (const video of libraryVideos) {
      const fullPath = path.join('/app/main', video.path);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`\n❌ File not found: ${video.path}`);
        totalFailed++;
        continue;
      }
      
      console.log(`\n🎥 ${video.title}:`);
      
      // Create video with metadata
      const videoId = await createVideoInBunny(library.id, library.key, video);
      
      if (videoId) {
        // Upload the actual file
        const uploaded = await uploadVideoFile(library.id, library.key, videoId, fullPath);
        
        if (uploaded) {
          totalUploaded++;
          
          // Verify final metadata
          console.log(`  🔍 Verifying final metadata...`);
          const verifyResponse = await fetch(
            `https://video.bunnycdn.com/library/${library.id}/videos/${videoId}`,
            {
              headers: {
                'AccessKey': library.key,
                'accept': 'application/json'
              }
            }
          );
          
          if (verifyResponse.ok) {
            const finalVideo = await verifyResponse.json();
            const hasMeta = finalVideo.metaTags && Object.keys(finalVideo.metaTags).length > 0;
            console.log(`  📊 Final metadata status: ${hasMeta ? '✅ Present' : '❌ Missing'}`);
            if (hasMeta) {
              console.log(`     Fields:`, Object.keys(finalVideo.metaTags).join(', '));
            }
          }
        } else {
          totalFailed++;
        }
      } else {
        totalFailed++;
      }
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 UPLOAD SUMMARY:');
  console.log(`✅ Successfully uploaded: ${totalUploaded}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Total: ${videos.length}`);
  
  if (totalUploaded > 0) {
    console.log('\n✨ Videos uploaded with metadata!');
    console.log('Check if categories now display correctly in the app.');
  }
}

// Check if we have the form-data module
try {
  require('form-data');
} catch (e) {
  console.log('Installing required dependencies...');
  require('child_process').execSync('npm install form-data', { stdio: 'inherit' });
}

// Run the upload
uploadVideosWithMetadata().catch(console.error);