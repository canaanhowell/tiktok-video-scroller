// Test what device type the frontend actually detects
const baseUrl = 'https://media.synthetikmedia.ai';

// Simulate different user agents to test device detection
const userAgents = {
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  tablet: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
};

// Copy the device detection logic from the hook
function getDeviceTypeFromUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile';
  } else if (/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)) {
    return 'tablet';
  }
  
  return 'desktop';
}

async function testFrontendDetection() {
  console.log('🕵️ Testing frontend device detection...\n');
  
  for (const [deviceName, userAgent] of Object.entries(userAgents)) {
    console.log(`📱 Testing ${deviceName} user agent:`);
    console.log(`   User Agent: ${userAgent}`);
    
    const detectedType = getDeviceTypeFromUserAgent(userAgent);
    console.log(`   Detected Type: ${detectedType}`);
    
    // Test what API would be called
    const url = `${baseUrl}/api/bunny-videos?device=${detectedType}`;
    console.log(`   API URL: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ ${data.videos.length} videos from library ${data.libraryId}`);
        
        // Check for categories that user reported as broken
        const musicianVideos = data.videos.filter(v => v.category === 'musicians');
        const videographerVideos = data.videos.filter(v => v.category === 'videographers');
        const djVideos = data.videos.filter(v => v.category === 'djs');
        
        console.log(`   Musicians: ${musicianVideos.length} videos`);
        console.log(`   Videographers: ${videographerVideos.length} videos`);
        console.log(`   DJs: ${djVideos.length} videos`);
        
        // Show if any are misclassified as general
        const generalVideos = data.videos.filter(v => v.category === 'general');
        if (generalVideos.length > 0) {
          console.log(`   🚨 ${generalVideos.length} videos showing as "general"`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testFrontendDetection();