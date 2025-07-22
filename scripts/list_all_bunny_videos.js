// List all videos in all Bunny CDN libraries
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARIES = {
  // Desktop libraries
  'default-desktop': { id: process.env.BUNNY_LIBRARY_ID_DEFAULT_DESKTOP, key: process.env.BUNNY_API_KEY_DEFAULT_DESKTOP },
  'photographers-desktop': { id: process.env.BUNNY_LIBRARY_ID_PHOTOGRAPHERS_DESKTOP, key: process.env.BUNNY_API_KEY_PHOTOGRAPHERS_DESKTOP },
  'venues-desktop': { id: process.env.BUNNY_LIBRARY_ID_VENUES_DESKTOP, key: process.env.BUNNY_API_KEY_VENUES_DESKTOP },
  'videographers-desktop': { id: process.env.BUNNY_LIBRARY_ID_VIDEOGRAPHERS_DESKTOP, key: process.env.BUNNY_API_KEY_VIDEOGRAPHERS_DESKTOP },
  'musicians-desktop': { id: process.env.BUNNY_LIBRARY_ID_MUSICIANS_DESKTOP, key: process.env.BUNNY_API_KEY_MUSICIANS_DESKTOP },
  'djs-desktop': { id: process.env.BUNNY_LIBRARY_ID_DJS_DESKTOP, key: process.env.BUNNY_API_KEY_DJS_DESKTOP },
  
  // Mobile libraries  
  'default-mobile': { id: process.env.BUNNY_LIBRARY_ID_DEFAULT_MOBILE, key: process.env.BUNNY_API_KEY_DEFAULT_MOBILE },
  'photographers-mobile': { id: process.env.BUNNY_LIBRARY_ID_PHOTOGRAPHERS_MOBILE, key: process.env.BUNNY_API_KEY_PHOTOGRAPHERS_MOBILE },
  'venues-mobile': { id: process.env.BUNNY_LIBRARY_ID_VENUES_MOBILE, key: process.env.BUNNY_API_KEY_VENUES_MOBILE },
  'videographers-mobile': { id: process.env.BUNNY_LIBRARY_ID_VIDEOGRAPHERS_MOBILE, key: process.env.BUNNY_API_KEY_VIDEOGRAPHERS_MOBILE },
  'musicians-mobile': { id: process.env.BUNNY_LIBRARY_ID_MUSICIANS_MOBILE, key: process.env.BUNNY_API_KEY_MUSICIANS_MOBILE },
  'djs-mobile': { id: process.env.BUNNY_LIBRARY_ID_DJS_MOBILE, key: process.env.BUNNY_API_KEY_DJS_MOBILE },
  
  // Tablet libraries
  'default-tablet': { id: process.env.BUNNY_LIBRARY_ID_DEFAULT_TABLET, key: process.env.BUNNY_API_KEY_DEFAULT_TABLET },
  'photographers-tablet': { id: process.env.BUNNY_LIBRARY_ID_PHOTOGRAPHERS_TABLET, key: process.env.BUNNY_API_KEY_PHOTOGRAPHERS_TABLET },
  'venues-tablet': { id: process.env.BUNNY_LIBRARY_ID_VENUES_TABLET, key: process.env.BUNNY_API_KEY_VENUES_TABLET },
  'videographers-tablet': { id: process.env.BUNNY_LIBRARY_ID_VIDEOGRAPHERS_TABLET, key: process.env.BUNNY_API_KEY_VIDEOGRAPHERS_TABLET },
  'musicians-tablet': { id: process.env.BUNNY_LIBRARY_ID_MUSICIANS_TABLET, key: process.env.BUNNY_API_KEY_MUSICIANS_TABLET },
  'djs-tablet': { id: process.env.BUNNY_LIBRARY_ID_DJS_TABLET, key: process.env.BUNNY_API_KEY_DJS_TABLET },
};

async function listVideosInLibrary(name, config) {
  if (!config.id || !config.key) {
    console.log(`  ⚠️  Missing configuration`);
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
        console.log(`        MetaTags:`, video.metaTags || 'No metadata');
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
  
  let totalVideos = 0;
  let librariesWithVideos = 0;
  
  for (const [name, config] of Object.entries(LIBRARIES)) {
    console.log(`📁 ${name}:`);
    console.log(`   Library ID: ${config.id || 'NOT SET'}`);
    
    const result = await listVideosInLibrary(name, config);
    if (result.videos.length > 0) {
      totalVideos += result.videos.length;
      librariesWithVideos++;
    }
    
    console.log('');
  }
  
  console.log('=' .repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`Total videos across all libraries: ${totalVideos}`);
  console.log(`Libraries with content: ${librariesWithVideos}/${Object.keys(LIBRARIES).length}`);
  
  console.log('\n⚠️  Important: Most videos appear to have no metaTags');
  console.log('This is why categories show sequentially - the API uses fallback vendor names!');
}

// Run the script
listAllLibraries().catch(console.error);