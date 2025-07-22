#!/usr/bin/env node
// Fix all main/input path references to staging_app/input
const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/app/main/web_app/scripts/fix_category_mapping_9x16.js',
  '/app/main/web_app/scripts/upload_missing_categories_9x16.js',
  '/app/main/web_app/scripts/truncate_and_upload_all_9x16_categories.js',
  '/app/main/web_app/scripts/upload_venues_9x16.js',
  '/app/main/web_app/scripts/check_video_content.js',
  '/app/main/web_app/scripts/upload_diverse_videos.js',
  '/app/main/web_app/scripts/upload_available_videos.js'
];

const pathReplacements = [
  {
    from: "'/app/main/input'",
    to: "'/app/main/staging_app/input'"
  },
  {
    from: '/app/main/input/',
    to: '/app/main/staging_app/input/'
  },
  {
    from: '/app/main/input/venues',
    to: '/app/main/staging_app/input/venues'
  },
  {
    from: '/app/main/input/photographers',
    to: '/app/main/staging_app/input/photographers'
  },
  {
    from: '/app/main/input/videographers',
    to: '/app/main/staging_app/input/videographers'
  },
  {
    from: '/app/main/input/musicians',
    to: '/app/main/staging_app/input/musicians'
  },
  {
    from: '/app/main/input/djs',
    to: '/app/main/staging_app/input/djs'
  },
  {
    from: '/app/main/input/output/ceremonies',
    to: '/app/main/staging_app/input/ceremonies'
  }
];

console.log('🔧 Fixing all main/input path references...\n');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Fixing ${path.basename(filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changesMade = 0;
    
    pathReplacements.forEach(replacement => {
      const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const beforeCount = (content.match(regex) || []).length;
      content = content.replace(regex, replacement.to);
      const afterCount = (content.match(new RegExp(replacement.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      
      if (beforeCount > 0) {
        changesMade += beforeCount;
        console.log(`   - Replaced ${beforeCount} instances of ${replacement.from}`);
      }
    });
    
    if (changesMade > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`   ✅ ${changesMade} changes made\n`);
    } else {
      console.log(`   ✅ No changes needed\n`);
    }
  } else {
    console.log(`   ⚠️  File not found: ${filePath}\n`);
  }
});

console.log('✅ Path reference fixes complete!');