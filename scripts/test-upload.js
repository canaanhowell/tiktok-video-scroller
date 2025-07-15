#!/usr/bin/env node

/**
 * Test script for video upload functionality
 * Usage: node scripts/test-upload.js <video-file-path>
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    const stats = fs.statSync(filePath);
    console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    // Upload to local server
    console.log('Uploading to http://localhost:3000/api/videos/upload...');
    
    const response = await axios.post('http://localhost:3000/api/videos/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          process.stdout.write(`\rUpload progress: ${percentage}%`);
        }
      },
    });

    console.log('\nUpload successful!');
    console.log('Video ID:', response.data.video.videoId);
    console.log('Video URL:', response.data.video.videoUrl);
    console.log('Thumbnail URL:', response.data.video.thumbnailUrl);
    console.log('Processing Status:', response.data.video.processingStatus);

  } catch (error) {
    console.error('\nUpload failed:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

// Get file path from command line
const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node scripts/test-upload.js <video-file-path>');
  console.log('Example: node scripts/test-upload.js ~/Downloads/sample.mp4');
  process.exit(1);
}

// Make sure the server is running
console.log('Make sure your Next.js dev server is running (npm run dev)');
console.log('Testing upload with file:', filePath);

testUpload(filePath);