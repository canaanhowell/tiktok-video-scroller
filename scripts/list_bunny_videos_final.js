// List all videos in all Bunny CDN libraries - with correct key mapping
require('dotenv').config({ path: '/app/main/web_app/.env' });

// Build library configurations
const LIBRARIES = {};

// First, get all library IDs
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('bunny_cdn_video_streaming_library_') && value) {
    const libraryName = key.replace('bunny_cdn_video_streaming_library_', '');
    LIBRARIES[libraryName] = { id: value, key: null };
  }
});

// Then match with API keys
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('bunny_cdn_video_streaming_key_') && value) {
    const keyName = key.replace('bunny_cdn_video_streaming_key_', '');
    if (LIBRARIES[keyName]) {
      LIBRARIES[keyName].key = value;
    }
  }
});

async function listVideosInLibrary(name, config) {
  if (!config.id || !config.key) {
    console.log(`  ⚠️  Missing ${!config.id ? 'library ID' : 'API key'}`);
    return { videos: [], error: 'Missing config' };
  }
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${config.id}/videos?page=1&itemsPerPage=100&orderBy=date`,
      {
        headers: {
          'AccessKey': config.key,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`  ❌ Error ${response.status}: ${errorText.substring(0, 100)}`);
      return { videos: [], error: response.status };
    }
    
    const data = await response.json();
    const videos = data.items || [];
    
    console.log(`  ✅ ${videos.length} videos found`);
    
    // Analyze metadata
    let videosWithMeta = 0;
    let metaFieldsFound = new Set();
    
    videos.forEach(video => {
      if (video.metaTags && Object.keys(video.metaTags).length > 0) {
        videosWithMeta++;
        Object.keys(video.metaTags).forEach(field => metaFieldsFound.add(field));
      }
    });
    
    if (videosWithMeta > 0) {
      console.log(`  📊 Videos with metadata: ${videosWithMeta}/${videos.length}`);
      console.log(`  🏷️  Metadata fields found: ${Array.from(metaFieldsFound).join(', ')}`);
    } else {
      console.log(`  ⚠️  NO METADATA found in any videos!`);
    }
    
    // Show sample videos
    if (videos.length > 0) {
      console.log('  📹 First 3 videos:');
      videos.slice(0, 3).forEach((video, i) => {
        console.log(`     ${i+1}. ${video.title || 'Untitled'} (${video.guid})`);
        if (video.metaTags && Object.keys(video.metaTags).length > 0) {
          console.log(`        MetaTags:`, JSON.stringify(video.metaTags));
        }
      });
    }
    
    return { videos, videosWithMeta, error: null };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { videos: [], videosWithMeta: 0, error: error.message };
  }
}

async function listAllLibraries() {
  console.log('🎬 Bunny CDN Video Libraries Analysis\n');
  console.log('=' .repeat(60) + '\n');
  
  let totalVideos = 0;
  let totalVideosWithMeta = 0;
  let librariesWithContent = 0;
  const results = {};
  
  // Group by category for better organization
  const categories = {
    'Default': ['16x9', '9x16'],
    'Photography': ['photography_16x9', 'photography_9x16'],
    'Videographers': ['videographers_16x9', 'videographers_9x16'],
    'Venues': ['venues_16x9', 'venues_9x16'],
    'Musicians': ['musicians_16x9', 'musicians_9x16'],
    'DJs': ['dj_16x9', 'dj_9x16'],
    'Florists': ['florists_16x9', 'florists_9x16'],
    'Wedding Cakes': ['wedding_cakes_16x9', 'wedding_cakes_9x16'],
    'Bands': ['bands_16x9', 'bands_9x16']
  };
  
  for (const [category, libraryNames] of Object.entries(categories)) {
    console.log(`\n📂 ${category} Libraries:`);
    console.log('-'.repeat(40));
    
    for (const libName of libraryNames) {
      if (LIBRARIES[libName]) {
        console.log(`\n📁 ${libName} (ID: ${LIBRARIES[libName].id}):`);
        const result = await listVideosInLibrary(libName, LIBRARIES[libName]);
        results[libName] = result;
        
        if (result.videos.length > 0) {
          totalVideos += result.videos.length;
          totalVideosWithMeta += result.videosWithMeta;
          librariesWithContent++;
        }
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 SUMMARY:');
  console.log(`Total libraries configured: ${Object.keys(LIBRARIES).length}`);
  console.log(`Libraries with content: ${librariesWithContent}`);
  console.log(`Total videos: ${totalVideos}`);
  console.log(`Videos with metadata: ${totalVideosWithMeta} (${totalVideos > 0 ? Math.round(totalVideosWithMeta/totalVideos*100) : 0}%)`);
  
  if (totalVideosWithMeta === 0 && totalVideos > 0) {
    console.log('\n🚨 CRITICAL: No videos have metadata!');
    console.log('This explains the sequential category bug - API uses fallback vendor names.');
  }
  
  return results;
}

// Export for use in truncation script
module.exports = { LIBRARIES, listAllLibraries };

// Run if called directly
if (require.main === module) {
  listAllLibraries().catch(console.error);
}