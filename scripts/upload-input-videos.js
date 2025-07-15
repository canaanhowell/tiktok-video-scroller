#!/usr/bin/env node

/**
 * Script to upload all videos from the input folder to Bunny CDN
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Bunny CDN configuration
const STREAMING_LIBRARY = process.env.bunny_cdn_streaming_library;
const STREAMING_KEY = process.env.bunny_cdn_streaming_key;
const STREAMING_HOSTNAME = process.env.bunny_cdn_streaming_hostname;

async function uploadVideoToBunny(filePath, title) {
  try {
    console.log(`\n📤 Uploading ${title}...`);
    
    // Step 1: Create video object in Bunny Stream
    const createResponse = await axios.post(
      `https://video.bunnycdn.com/library/${STREAMING_LIBRARY}/videos`,
      { title },
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': STREAMING_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const videoId = createResponse.data.guid;
    console.log(`✅ Created video object: ${videoId}`);
    
    // Step 2: Upload the actual video file
    const fileStream = fs.createReadStream(filePath);
    const fileStats = fs.statSync(filePath);
    
    console.log(`📊 File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);
    
    const uploadResponse = await axios.put(
      `https://video.bunnycdn.com/library/${STREAMING_LIBRARY}/videos/${videoId}`,
      fileStream,
      {
        headers: {
          'AccessKey': STREAMING_KEY,
          'Content-Type': 'video/mp4',
          'Content-Length': fileStats.size
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            process.stdout.write(`\r⏳ Upload progress: ${percentage}%`);
          }
        }
      }
    );
    
    console.log(`\n✅ Video uploaded successfully!`);
    console.log(`🎬 Video ID: ${videoId}`);
    console.log(`🔗 Video URL: https://${STREAMING_HOSTNAME}/${videoId}/playlist.m3u8`);
    console.log(`🖼️  Thumbnail: https://${STREAMING_HOSTNAME}/${videoId}/thumbnail.jpg`);
    
    return {
      videoId,
      videoUrl: `https://${STREAMING_HOSTNAME}/${videoId}/playlist.m3u8`,
      thumbnailUrl: `https://${STREAMING_HOSTNAME}/${videoId}/thumbnail.jpg`
    };
    
  } catch (error) {
    console.error(`\n❌ Error uploading ${title}:`, error.response?.data || error.message);
    throw error;
  }
}

async function uploadAllVideos() {
  const inputDir = path.join(__dirname, '../input');
  
  console.log('🎥 TikTok Video Uploader - Bunny CDN');
  console.log('=====================================');
  console.log(`📁 Input directory: ${inputDir}`);
  console.log(`🐰 Bunny Stream Library: ${STREAMING_LIBRARY}`);
  console.log(`🌐 Streaming hostname: ${STREAMING_HOSTNAME}`);
  
  // Get all video files from input folder
  const files = fs.readdirSync(inputDir)
    .filter(file => file.endsWith('.mp4'))
    .sort();
  
  console.log(`\n📹 Found ${files.length} videos to upload:`, files);
  
  const results = [];
  
  // Upload each video
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const title = `TikTok Video ${file.replace('.mp4', '')}`;
    
    try {
      const result = await uploadVideoToBunny(filePath, title);
      results.push({ file, ...result });
    } catch (error) {
      console.error(`Failed to upload ${file}, continuing with next...`);
    }
  }
  
  // Save results to a file
  const resultsPath = path.join(__dirname, '../uploaded-videos.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Upload Summary:');
  console.log('===================');
  console.log(`✅ Successfully uploaded: ${results.length}/${files.length} videos`);
  console.log(`📄 Results saved to: ${resultsPath}`);
  
  console.log('\n📺 Uploaded Videos:');
  results.forEach((video, index) => {
    console.log(`\n${index + 1}. ${video.file}`);
    console.log(`   Video ID: ${video.videoId}`);
    console.log(`   Stream URL: ${video.videoUrl}`);
  });
}

// Check if environment variables are set
if (!STREAMING_LIBRARY || !STREAMING_KEY || !STREAMING_HOSTNAME) {
  console.error('❌ Missing Bunny CDN environment variables!');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Run the upload
uploadAllVideos().catch(console.error);