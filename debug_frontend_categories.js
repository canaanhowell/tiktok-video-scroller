// Check what the frontend is actually receiving for categories
const baseUrl = 'https://media.synthetikmedia.ai';

async function debugFrontendCategories() {
  console.log('🔍 Debugging frontend category display...\n');
  
  // Test the Popular tab API response
  const response = await fetch(`${baseUrl}/api/bunny-videos?category=popular`);
  const data = await response.json();
  
  console.log('📊 API Response for Popular tab:');
  console.log(`Success: ${data.success}`);
  console.log(`Videos: ${data.videos?.length || 0}`);
  console.log('');
  
  if (data.videos) {
    console.log('🎯 What categories SHOULD be displayed:');
    data.videos.forEach((video, i) => {
      console.log(`Video ${i+1}: @${video.username}`);
      console.log(`  Title: "${video.title}"`);
      console.log(`  Vendor: "${video.vendorName}"`);
      console.log(`  Category: "${video.category}" ← This should show in UI`);
      console.log(`  Description: "${video.description}"`);
      console.log('');
    });
    
    console.log('🚨 If the UI shows different categories, there\'s a frontend bug!');
    console.log('Check browser console for [VideoItem] logs to see what data reaches the component.');
  }
}

debugFrontendCategories();