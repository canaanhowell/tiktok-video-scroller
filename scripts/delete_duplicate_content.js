// Delete videos with duplicate content
require('dotenv').config({ path: '/app/main/web_app/.env' });

const LIBRARY = {
  id: process.env.bunny_cdn_video_streaming_library_16x9,
  key: process.env.bunny_cdn_video_streaming_key_16x9
};

// Videos that all have the same cello content (uploaded by upload_diverse_videos.js)
const duplicateContentVideos = [
  { guid: 'f75432fb-8bf1-4289-a078-2afdd9ef08da', title: 'Sunset Photography Wedding Showcase' },
  { guid: 'ebae46e5-7eb6-42b4-988e-5da8cdfc4584', title: 'DJ Spectacular Party Mix' },
  { guid: '854cc999-e088-4517-af15-b5d23805b797', title: 'Royal Gardens Venue Tour' },
  { guid: 'b0c54321-a9f9-4b1e-bb5a-06686f85f280', title: 'Forever Films Cinematic Reel' }
];

async function deleteVideo(guid, title) {
  console.log(`🗑️  Deleting: ${title}`);
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY.id}/videos/${guid}`,
      {
        method: 'DELETE',
        headers: {
          'AccessKey': LIBRARY.key,
          'accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      console.log(`   ✅ Deleted successfully`);
      return true;
    } else {
      console.log(`   ❌ Failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function cleanupDuplicates() {
  console.log('🧹 Cleaning Up Duplicate Content Videos\n');
  console.log('=' .repeat(60) + '\n');
  
  console.log('These videos all have the same cello player content');
  console.log('but different metadata. Deleting to avoid confusion.\n');
  
  let deleted = 0;
  
  for (const video of duplicateContentVideos) {
    if (await deleteVideo(video.guid, video.title)) {
      deleted++;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`\n✅ Deleted ${deleted}/${duplicateContentVideos.length} duplicate content videos`);
  
  console.log('\n📊 Remaining unique videos:');
  console.log('- "1" (venues) - Elegant Venues');
  console.log('- "Side shot..." (musicians) - Harmony Musicians');
  console.log('- "Gen-4 slowmotion..." (musicians) - Nashville Strings');
  
  console.log('\n💡 Next: Upload videos with appropriate content for each category');
}

cleanupDuplicates().catch(console.error);