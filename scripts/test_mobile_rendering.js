#!/usr/bin/env node
// Test what's happening with mobile rendering
require('dotenv').config({ path: '/app/main/web_app/.env' });

async function testMobileRendering() {
  console.log('🔍 Testing Mobile Rendering Issue\n');
  console.log('=' .repeat(60) + '\n');
  
  // Test 1: Check if API returns videos
  console.log('1️⃣ Testing API Response:');
  try {
    const response = await fetch('https://media.synthetikmedia.ai/api/bunny-videos?device=mobile&category=default');
    const data = await response.json();
    
    console.log(`   Success: ${data.success}`);
    console.log(`   Video Count: ${data.videos?.length || 0}`);
    
    if (data.videos?.length > 0) {
      console.log(`   ✅ API returns videos correctly\n`);
      
      // Check video URLs
      console.log('2️⃣ Checking Video URLs:');
      const firstVideo = data.videos[0];
      console.log(`   First video URL: ${firstVideo.src}`);
      console.log(`   Is HLS: ${firstVideo.src.includes('.m3u8')}`);
      
      // Test if video URL is accessible
      const videoResponse = await fetch(firstVideo.src, { method: 'HEAD' });
      console.log(`   Video URL accessible: ${videoResponse.ok ? '✅ Yes' : '❌ No'}`);
      console.log(`   Response status: ${videoResponse.status}`);
    } else {
      console.log(`   ❌ No videos returned\n`);
    }
  } catch (error) {
    console.log(`   ❌ API Error: ${error.message}\n`);
  }
  
  // Test 2: Check for any special characters in metadata
  console.log('\n3️⃣ Checking for Problematic Metadata:');
  try {
    const response = await fetch('https://media.synthetikmedia.ai/api/bunny-videos?device=mobile&category=default');
    const data = await response.json();
    
    if (data.videos?.length > 0) {
      data.videos.slice(0, 3).forEach((video, i) => {
        console.log(`\n   Video ${i+1}:`);
        console.log(`   Title length: ${video.title?.length || 0}`);
        console.log(`   Has special chars in title: ${/[^\x20-\x7E]/.test(video.title || '')}`);
        console.log(`   Category: "${video.category}" (type: ${typeof video.category})`);
        console.log(`   Vendor: "${video.vendorName}" (type: ${typeof video.vendorName})`);
        
        // Check for any undefined or null values
        Object.entries(video).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            console.log(`   ⚠️  ${key} is ${value}`);
          }
        });
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n💡 Possible issues:');
  console.log('1. CORS blocking video URLs on mobile browsers');
  console.log('2. HLS not loading properly on mobile');
  console.log('3. Multiple loading spinners stacking (colorful effect)');
  console.log('4. Metadata parsing causing render issues');
  
  console.log('\n🔧 To debug on mobile:');
  console.log('1. Open https://media.synthetikmedia.ai/mobile-debug');
  console.log('2. Check the console output there');
  console.log('3. Look for any JavaScript errors');
}

testMobileRendering().catch(console.error);