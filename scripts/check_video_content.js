// Check actual video content by examining what we uploaded
const fs = require('fs');

console.log('🔍 Checking Video Upload History\n');
console.log('=' .repeat(60) + '\n');

console.log('📊 What we uploaded:\n');

// Check upload_diverse_videos.js
console.log('From upload_diverse_videos.js:');
console.log('- All 4 videos used the SAME sample file');
console.log('- Sample file: Gen-4 slowmotion playing the cello 190716958.mp4');
console.log('- This is why all videos show the same content!\n');

console.log('Videos created:');
console.log('1. Forever Films Cinematic Reel (videographers)');
console.log('2. Royal Gardens Venue Tour (venues)');
console.log('3. DJ Spectacular Party Mix (djs)');
console.log('4. Sunset Photography Wedding Showcase (photographers)');
console.log('\nAll have different metadata but SAME video file!\n');

console.log('=' .repeat(60));
console.log('\n⚠️  PROBLEM IDENTIFIED:');
console.log('We uploaded the same video file (cello player) to all entries.');
console.log('Each has different metadata (category, vendor) but same content.');
console.log('\n💡 SOLUTION:');
console.log('1. Delete these duplicate-content videos');
console.log('2. Upload unique video files for each category');
console.log('3. Or at least use different sample videos for each category');

// Show which files are available
console.log('\n📁 Available video files:');
const directories = [
  '/app/main/staging_app/input/musicians',
  '/app/main/staging_app/input/output/ceremonies',
  '/app/main/staging_app/input/venues',
  '/app/main/staging_app/input/photographers',
  '/app/main/staging_app/input/videographers',
  '/app/main/staging_app/input/djs'
];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4'));
    if (files.length > 0) {
      console.log(`\n${dir}:`);
      files.slice(0, 3).forEach(f => console.log(`  - ${f}`));
    }
  }
});

console.log('\n🎯 Next Steps:');
console.log('1. Delete the duplicate-content videos');
console.log('2. Upload category-appropriate videos');
console.log('3. Ensure each video has unique content');