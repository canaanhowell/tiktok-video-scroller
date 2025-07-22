#!/usr/bin/env node

/**
 * Script to scan staging_app/input subdirectories and update batch_videos.json
 * with the actual video files found in each category folder
 */

const fs = require('fs');
const path = require('path');

const BATCH_FILE = path.join(__dirname, 'input', 'batch_videos.json');
const INPUT_DIR = path.join(__dirname, 'input');

// Supported video extensions
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];

// Load existing batch configuration
function loadBatchConfig() {
  try {
    const data = fs.readFileSync(BATCH_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading batch_videos.json:', error);
    process.exit(1);
  }
}

// Scan directory for video files
function scanForVideos(dirPath) {
  const videos = [];
  
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          videos.push({
            filename: file,
            path: path.relative(INPUT_DIR, filePath),
            size: stat.size,
            modified: stat.mtime.toISOString()
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return videos;
}

// Extract vendor info from filename (if follows naming convention)
function extractVendorFromFilename(filename) {
  // Example patterns:
  // vendorname_service_date.mp4
  // vendor-name_category_timestamp.mp4
  
  const baseName = path.basename(filename, path.extname(filename));
  const parts = baseName.split(/[_-]/);
  
  if (parts.length >= 2) {
    return {
      name: parts[0].replace(/([A-Z])/g, ' $1').trim(),
      serviceHint: parts[1]
    };
  }
  
  return {
    name: baseName,
    serviceHint: null
  };
}

// Create video entry with metadata
function createVideoEntry(videoFile, category, defaultMetadata) {
  const vendorInfo = extractVendorFromFilename(videoFile.filename);
  
  return {
    filename: videoFile.filename,
    path: videoFile.path,
    fileSize: videoFile.size,
    lastModified: videoFile.modified,
    title: `${vendorInfo.name} - ${category} Showcase`,
    description: `Professional ${category} service video`,
    vendor: {
      name: vendorInfo.name,
      ...defaultMetadata,
      email: `${vendorInfo.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: "(555) 000-0000",
      website: `https://${vendorInfo.name.toLowerCase().replace(/\s+/g, '-')}.com`
    },
    videoMetadata: {
      tags: [category, "wedding", "professional", vendorInfo.serviceHint].filter(Boolean),
      duration: null,
      resolution: "1080x1920",
      status: "pending"
    }
  };
}

// Main function
function updateBatchVideos() {
  console.log('Loading batch configuration...');
  const config = loadBatchConfig();
  
  let totalVideos = 0;
  
  // Scan each category folder
  Object.keys(config.categories).forEach(category => {
    const categoryConfig = config.categories[category];
    const categoryPath = path.join(__dirname, 'input', category);
    
    console.log(`\nScanning ${category} folder: ${categoryPath}`);
    
    const videos = scanForVideos(categoryPath);
    
    if (videos.length > 0) {
      console.log(`  Found ${videos.length} video(s)`);
      
      // Create video entries with metadata
      categoryConfig.videos = videos.map(video => 
        createVideoEntry(video, category, categoryConfig.defaultVendorMetadata)
      );
      
      totalVideos += videos.length;
    } else {
      console.log('  No videos found');
      categoryConfig.videos = [];
    }
  });
  
  // Update batch info
  config.batchInfo.lastScanned = new Date().toISOString();
  config.batchInfo.totalVideos = totalVideos;
  
  // Save updated configuration
  console.log(`\nTotal videos found: ${totalVideos}`);
  console.log('Saving updated batch_videos.json...');
  
  fs.writeFileSync(BATCH_FILE, JSON.stringify(config, null, 2));
  console.log('Update complete!');
  
  // Summary
  console.log('\nSummary by category:');
  Object.keys(config.categories).forEach(category => {
    const count = config.categories[category].videos.length;
    if (count > 0) {
      console.log(`  ${category}: ${count} video(s)`);
    }
  });
}

// Run the script
updateBatchVideos();