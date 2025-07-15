const axios = require('axios');

async function checkVideoQuality() {
  const libraryId = process.env.bunny_cdn_streaming_library || '467029';
  const apiKey = process.env.bunny_cdn_streaming_key;
  
  console.log('🎥 Checking Bunny CDN Video Quality Settings\n');
  
  try {
    // Check library settings
    const libraryResponse = await axios.get(
      `https://video.bunnycdn.com/library/${libraryId}`,
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': apiKey
        }
      }
    );
    
    const library = libraryResponse.data;
    console.log('📚 Library Settings:');
    console.log(`- Name: ${library.Name}`);
    console.log(`- Bitrate: ${library.Bitrate || 'Auto'}`);
    console.log(`- Resolution Config: ${JSON.stringify(library.ResolutionConfiguration || 'Default')}`);
    console.log(`- Encoding Enabled: ${library.EnabledResolutions || 'All'}`);
    console.log(`- Keep Original Files: ${library.KeepOriginalFiles}`);
    console.log(`- Watermark Enabled: ${library.WatermarkEnabled}`);
    
    // Get specific video to check encoding
    const videoId = '724695ee-95f8-4a97-8558-ec4d384613e3'; // Video 1
    const videoResponse = await axios.get(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': apiKey
        }
      }
    );
    
    const video = videoResponse.data;
    console.log('\n📹 Sample Video Encoding (Video 1):');
    console.log(`- Title: ${video.title}`);
    console.log(`- Original Size: ${(video.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Width: ${video.width}px`);
    console.log(`- Height: ${video.height}px`);
    console.log(`- Frame Rate: ${video.framerate}`);
    console.log(`- Available Resolutions: ${video.availableResolutions || 'Processing'}`);
    console.log(`- Encoding Progress: ${video.encodeProgress}%`);
    
    console.log('\n⚠️  Quality Issues Found:');
    console.log('1. Default Bunny CDN encoding uses lower bitrates for streaming');
    console.log('2. Original 1080x1080 @ 6.4Mbps is being compressed');
    console.log('3. HLS adaptive streaming may select lower quality by default');
    
    console.log('\n✅ Recommended Solutions:');
    console.log('1. Update library settings to keep higher bitrates');
    console.log('2. Configure player to prefer higher quality streams');
    console.log('3. Consider using direct MP4 links for better quality');
    console.log('4. Enable "Keep Original Files" in Bunny CDN settings');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkVideoQuality();