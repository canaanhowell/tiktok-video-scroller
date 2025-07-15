#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testBunnyAPI() {
  console.log('🔍 Testing Bunny CDN API directly...\n');
  
  const STREAMING_LIBRARY = process.env.bunny_cdn_streaming_library;
  const STREAMING_KEY = process.env.bunny_cdn_streaming_key;
  const STREAMING_HOSTNAME = process.env.bunny_cdn_streaming_hostname;
  
  console.log('Configuration:');
  console.log('Library ID:', STREAMING_LIBRARY);
  console.log('Hostname:', STREAMING_HOSTNAME);
  console.log('Key:', STREAMING_KEY ? '✓ Present' : '✗ Missing');
  
  try {
    // Test direct API call to Bunny
    const response = await axios.get(
      `https://video.bunnycdn.com/library/${STREAMING_LIBRARY}/videos`,
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': STREAMING_KEY
        },
        params: {
          page: 1,
          itemsPerPage: 10,
          orderBy: 'date'
        }
      }
    );
    
    console.log('\n📹 Videos found:', response.data.totalItems);
    console.log('\nVideo List:');
    
    response.data.items.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   ID: ${video.guid}`);
      console.log(`   Status: ${video.status} (${video.status === 4 ? 'Ready' : video.status === 3 ? 'Encoding' : 'Processing'})`);
      console.log(`   Created: ${new Date(video.dateUploaded).toLocaleString()}`);
      console.log(`   Duration: ${video.length} seconds`);
      console.log(`   URL: https://${STREAMING_HOSTNAME}/${video.guid}/playlist.m3u8`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testBunnyAPI();