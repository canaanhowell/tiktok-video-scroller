#!/usr/bin/env node

/**
 * Fetch all videos from Bunny CDN Streaming Library
 * Updates the video service with actual video data
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Bunny CDN credentials from .env
const STREAMING_LIBRARY = '467029';
const STREAMING_KEY = '931f28b3-fc95-4659-a29300277c12-1643-4c31';
const HOSTNAME = 'vz-97606b97-31d.b-cdn.net';

async function fetchBunnyVideos() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'video.bunnycdn.com',
      port: 443,
      path: `/library/${STREAMING_LIBRARY}/videos`,
      method: 'GET',
      headers: {
        'AccessKey': STREAMING_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    console.log('🔍 Fetching videos from Bunny CDN...');
    console.log(`📚 Library ID: ${STREAMING_LIBRARY}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`✅ Found ${response.totalItems} videos in library`);
            resolve(response);
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    req.end();
  });
}

function generateVideoServiceData(bunnyVideos) {
  console.log('🔄 Converting Bunny CDN data to service format...');
  
  const videos = bunnyVideos.items.map((video, index) => {
    // Generate usernames and descriptions
    const usernames = ['synthetikmedia', 'creator_studio', 'video_artist', 'content_maker'];
    const username = usernames[index % usernames.length];
    
    const descriptions = [
      'Amazing wedding moments 💕',
      'Beautiful love story 💖',
      'Romantic celebration 🎊',
      'Forever together 👰🤵',
      'Special memories 🌹',
      'Wedding highlights ✨',
      'Love in motion 💍',
      'Perfect moments 📸',
      'Happy couple 💑',
      'Wedding magic 🎬'
    ];
    const description = descriptions[index % descriptions.length];

    return {
      id: video.guid,
      src: `https://${HOSTNAME}/${video.guid}/playlist.m3u8`,
      username: username,
      description: `${description} #${index + 1}`,
      likes: Math.floor(Math.random() * 10000) + 100,
      comments: Math.floor(Math.random() * 500) + 10,
      shares: Math.floor(Math.random() * 200) + 5,
      views: Math.floor(Math.random() * 20000) + 500,
      duration: video.length || 30,
      createdAt: video.dateUploaded || new Date().toISOString(),
      creatorId: `creator${(index % 4) + 1}`,
      tags: ['wedding', 'romance', 'love', 'celebration'][Math.floor(Math.random() * 4)],
      isPublic: true
    };
  });

  return videos;
}

function updateVideoService(videos) {
  console.log('📝 Updating video service file...');
  
  const servicePath = path.join(__dirname, '..', 'src', 'services', 'videos.ts');
  let content = fs.readFileSync(servicePath, 'utf8');
  
  // Generate the videos array code
  const videosCode = videos.map(video => `      {
        id: '${video.id}',
        src: '${video.src}',
        username: '${video.username}',
        description: '${video.description}',
        likes: ${video.likes},
        comments: ${video.comments},
        shares: ${video.shares},
        views: ${video.views},
        duration: ${video.duration},
        createdAt: '${video.createdAt}',
        creatorId: '${video.creatorId}',
        tags: ['${video.tags}'],
        isPublic: true
      }`).join(',\n');

  // Replace the mock data section
  const startMarker = '    // Temporary mock data for development - using actual Bunny CDN videos';
  const endMarker = '    ]';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find video data section in service file');
  }
  
  const newContent = content.slice(0, startIndex) + 
    `    // Auto-generated from Bunny CDN Streaming Library (${videos.length} videos)\n    return [\n${videosCode}\n    ]`;
  
  fs.writeFileSync(servicePath, newContent);
  console.log(`✅ Updated service with ${videos.length} videos`);
}

async function main() {
  try {
    console.log('🚀 Starting Bunny CDN video sync...\n');
    
    const bunnyResponse = await fetchBunnyVideos();
    console.log(`📊 Total videos: ${bunnyResponse.totalItems}`);
    console.log(`📄 Current page: ${bunnyResponse.currentPage} of ${Math.ceil(bunnyResponse.totalItems / bunnyResponse.itemsPerPage)}\n`);
    
    if (bunnyResponse.items && bunnyResponse.items.length > 0) {
      const videos = generateVideoServiceData(bunnyResponse);
      updateVideoService(videos);
      
      console.log('\n🎉 Success! Video service updated with Bunny CDN library');
      console.log(`📺 ${videos.length} videos are now available in the app`);
      console.log('\n🔄 Run npm run build && deploy to see changes in production');
    } else {
      console.log('⚠️ No videos found in Bunny CDN library');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fetchBunnyVideos, generateVideoServiceData, updateVideoService };