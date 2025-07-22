// List all videos in all Bunny CDN libraries - using correct env var names
require('dotenv').config({ path: '/app/main/web_app/.env' });

// Extract library configurations from environment
const LIBRARIES = {};

// Parse environment variables for library IDs and API keys
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('bunny_cdn_video_streaming_library_') && !key.includes('_api_key')) {
    const libraryName = key.replace('bunny_cdn_video_streaming_library_', '');
    const apiKeyVar = `bunny_cdn_video_streaming_library_${libraryName}_api_key`;
    
    LIBRARIES[libraryName] = {
      id: value,
      key: process.env[apiKeyVar]
    };
  }
});

async function listVideosInLibrary(name, config) {
  if (!config.id || !config.key) {
    console.log(`  ⚠️  Missing configuration (ID: ${config.id || 'missing'}, Key: ${config.key ? 'present' : 'missing'})`);
    return { videos: [], error: 'Missing config' };
  }
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${config.id}/videos?page=1&itemsPerPage=100`,
      {
        headers: {
          'AccessKey': config.key,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`  ❌ Error: ${response.status}`);
      return { videos: [], error: response.status };
    }
    
    const data = await response.json();
    const videos = data.items || [];
    
    console.log(`  ✅ ${videos.length} videos`);
    
    // Show first few videos with metadata
    if (videos.length > 0) {
      console.log('  📹 Sample videos:');
      videos.slice(0, 3).forEach((video, i) => {
        console.log(`     ${i+1}. ${video.title || 'Untitled'}`);
        console.log(`        GUID: ${video.guid}`);
        console.log(`        MetaTags:`, JSON.stringify(video.metaTags || {}));
        console.log(`        Status: ${video.status === 4 ? 'Ready' : 'Processing'}`);
      });
    }
    
    return { videos, error: null };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { videos: [], error: error.message };
  }
}

async function listAllLibraries() {
  console.log('🎬 Bunny CDN Video Libraries Status\n');
  console.log('=' .repeat(50) + '\n');
  
  console.log(`Found ${Object.keys(LIBRARIES).length} libraries in environment\n`);
  
  let totalVideos = 0;
  let librariesWithVideos = 0;
  const videosByLibrary = {};
  
  // Sort libraries for consistent output
  const sortedLibraries = Object.entries(LIBRARIES).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [name, config] of sortedLibraries) {
    console.log(`📁 ${name}:`);
    console.log(`   Library ID: ${config.id}`);
    
    const result = await listVideosInLibrary(name, config);
    videosByLibrary[name] = result.videos;
    
    if (result.videos.length > 0) {
      totalVideos += result.videos.length;
      librariesWithVideos++;
      
      // Check metadata status
      const videosWithMeta = result.videos.filter(v => v.metaTags && Object.keys(v.metaTags).length > 0);
      console.log(`   📊 Videos with metadata: ${videosWithMeta.length}/${result.videos.length}`);
    }
    
    console.log('');
  }
  
  console.log('=' .repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`Total videos across all libraries: ${totalVideos}`);
  console.log(`Libraries with content: ${librariesWithVideos}/${Object.keys(LIBRARIES).length}`);
  
  // Show which libraries have the most content
  console.log('\n📈 Libraries by video count:');
  Object.entries(videosByLibrary)
    .filter(([_, videos]) => videos.length > 0)
    .sort(([_, a], [__, b]) => b.length - a.length)
    .forEach(([name, videos]) => {
      console.log(`   ${name}: ${videos.length} videos`);
    });
  
  console.log('\n⚠️  Important: Check if videos have metaTags for proper category detection');
  
  return videosByLibrary;
}

// Run the script
listAllLibraries().catch(console.error);