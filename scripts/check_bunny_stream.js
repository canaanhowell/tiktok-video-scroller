#!/usr/bin/env node
// Check if Bunny CDN is serving test pattern
require('dotenv').config({ path: '/app/main/web_app/.env' });

async function checkBunnyStream() {
  console.log('🔍 Checking if SMPTE test pattern is coming from Bunny CDN\n');
  console.log('=' .repeat(60) + '\n');
  
  // Get a video URL
  const response = await fetch('https://media.synthetikmedia.ai/api/bunny-videos?device=mobile&category=default');
  const data = await response.json();
  
  if (data.videos && data.videos.length > 0) {
    const video = data.videos[0];
    console.log('Testing video:', video.title);
    console.log('URL:', video.src);
    console.log('');
    
    // Fetch the m3u8 playlist
    const playlistResponse = await fetch(video.src);
    const playlistText = await playlistResponse.text();
    
    console.log('Playlist response status:', playlistResponse.status);
    console.log('Content-Type:', playlistResponse.headers.get('content-type'));
    console.log('');
    
    if (playlistResponse.ok) {
      console.log('First 500 chars of playlist:');
      console.log(playlistText.substring(0, 500));
      console.log('');
      
      // Check if this looks like a valid HLS playlist
      if (playlistText.includes('#EXTM3U')) {
        console.log('✅ Valid HLS playlist detected');
        
        // Check for test pattern indicators
        if (playlistText.toLowerCase().includes('test') || 
            playlistText.toLowerCase().includes('smpte') ||
            playlistText.toLowerCase().includes('bars')) {
          console.log('⚠️  Playlist contains test pattern keywords!');
        } else {
          console.log('✅ No test pattern keywords found in playlist');
        }
      } else {
        console.log('❌ Not a valid HLS playlist!');
        console.log('This might trigger a fallback test pattern in the player');
      }
    } else {
      console.log('❌ Failed to fetch playlist');
      console.log('This would cause the player to show an error or test pattern');
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n💡 Conclusion:');
  console.log('If the SMPTE bars appear only on mobile, it could be:');
  console.log('1. Mobile browser blocking HLS playback');
  console.log('2. HLS.js not initializing properly on mobile');
  console.log('3. A mobile-specific error handler showing test bars');
  console.log('4. Bunny CDN serving different content to mobile user agents');
}

checkBunnyStream().catch(console.error);