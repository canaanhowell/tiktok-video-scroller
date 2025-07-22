#!/usr/bin/env node
// Diagnose why mobile shows SMPTE color bars test pattern

console.log('🎨 SMPTE Color Bars Test Pattern Diagnosis\n');
console.log('=' .repeat(60) + '\n');

console.log('📺 What you\'re seeing:');
console.log('The 8 vertical color bars (white, cyan, magenta, blue, yellow, green, red, black)');
console.log('are SMPTE test bars - a standard video test pattern.\n');

console.log('🔍 This appears when:');
console.log('1. Video source URL is invalid or returns an error');
console.log('2. HLS manifest (.m3u8) can\'t be loaded');
console.log('3. Video codec/format isn\'t supported');
console.log('4. CORS blocks the video stream');
console.log('5. The video player falls back to a test pattern\n');

console.log('💡 The counter (0-9) suggests:');
console.log('- 10 videos are trying to load (indexed 0-9)');
console.log('- Each is failing and showing test bars');
console.log('- The counter shows which video is attempting to load\n');

console.log('🐛 Common causes on mobile:');
console.log('1. iOS Safari requires special HLS handling');
console.log('2. Android Chrome may have CORS restrictions');
console.log('3. Mobile browsers may block autoplay');
console.log('4. Network restrictions on cellular data\n');

console.log('🔧 Debugging steps:');
console.log('1. Check if videos load on mobile Safari vs Chrome');
console.log('2. Try on WiFi vs cellular');
console.log('3. Check browser console for CORS errors');
console.log('4. Test with a simple HTML5 video tag');
console.log('5. Verify Bunny CDN allows mobile user agents\n');

console.log('📱 Quick test URL:');
console.log('Open this on your mobile device:');
console.log('https://media.synthetikmedia.ai/mobile-debug\n');

console.log('🎯 Most likely issue:');
console.log('The HLS.js library might not be loading properly on mobile,');
console.log('causing the video player to show test bars as a fallback.');
console.log('\nThe fact that desktop works (even when narrowed) suggests');
console.log('it\'s related to mobile-specific video handling, not responsive CSS.');

// Check if we can identify the specific issue
console.log('\n' + '=' .repeat(60));
console.log('\n🔍 Let\'s check the video URLs again...\n');

const fetch = require('node-fetch');

async function checkVideoAccess() {
  try {
    // Test from mobile user agent
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
    
    const response = await fetch('https://media.synthetikmedia.ai/api/bunny-videos?device=mobile&category=default');
    const data = await response.json();
    
    if (data.videos && data.videos.length > 0) {
      const testVideo = data.videos[0];
      console.log('Testing video access with mobile user agent...');
      console.log(`Video URL: ${testVideo.src}`);
      
      // Try to fetch with mobile user agent
      const videoResponse = await fetch(testVideo.src, {
        method: 'HEAD',
        headers: {
          'User-Agent': mobileUA,
          'Referer': 'https://media.synthetikmedia.ai/'
        }
      });
      
      console.log(`Response: ${videoResponse.status} ${videoResponse.statusText}`);
      console.log(`CORS headers: ${videoResponse.headers.get('access-control-allow-origin') || 'Not set'}`);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Only run if node-fetch is available
try {
  checkVideoAccess();
} catch (e) {
  console.log('\nNote: Install node-fetch to test video access');
}