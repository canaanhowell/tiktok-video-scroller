# Video Upload Guide

## 📁 Directory Structure

All videos should be placed in the staging directory with the following structure:

```
/app/main/staging_app/input/
├── batch_videos.json          # Master metadata file (REQUIRED)
├── venues/9x16/              # Venue videos for mobile
├── photographers/9x16/       # Photography videos for mobile  
├── videographers/9x16/       # Videography videos for mobile
├── musicians/9x16/           # Music videos for mobile
└── djs/9x16/                 # DJ videos for mobile
```

## 📋 Metadata File Format

The `batch_videos.json` file must contain metadata for each video:

```json
[
  {
    "filename": "venue_wedding_garden.mp4",
    "title": "Elegant Garden Wedding Venue",
    "category": "venues", 
    "vendor": "Elegant Gardens",
    "city": "Nashville",
    "state": "Tennessee",
    "zipcode": "37215",
    "resolution": "9x16"
  }
]
```

### Required Fields
- `filename`: Exact filename including .mp4 extension
- `title`: Display title for the video
- `category`: Must match directory (venues, photographers, videographers, musicians, djs)
- `vendor`: Business name
- `city`: City name
- `state`: Full state name
- `zipcode`: ZIP code
- `resolution`: "9x16" for mobile, "16x9" for desktop

## 🚀 Upload Process

### 1. Prepare Videos
- Place videos in correct category/9x16/ directory
- Ensure filenames match exactly in batch_videos.json
- Videos should be in MP4 format

### 2. Update Metadata
- Add entries to `batch_videos.json` for each new video
- Validate JSON syntax
- Ensure category matches directory

### 3. Run Upload Script
```bash
cd /app/main/web_app
node scripts/upload_from_staging_9x16.js
```

### 4. Verify Upload
The script will:
- ✅ Load metadata from batch_videos.json
- ✅ Match videos to metadata by filename
- ✅ Skip videos without metadata (no placeholders policy)
- ✅ Upload with proper Bunny CDN moments metadata
- ✅ Report success/failure for each video

## ⚠️ Important Rules

### No Placeholder Policy
- Empty input folders = empty libraries
- Videos without metadata in JSON will be skipped
- No fallback or placeholder content will be used

### Category Validation
- Video category in JSON must match directory
- Mismatched categories will be skipped
- Maintains content integrity per category

### Filename Matching
- Filenames must match exactly between directory and JSON
- Case sensitive matching
- No automatic filename corrections

## 🔍 Troubleshooting

### Video Skipped - No Metadata
- Check filename spelling in batch_videos.json
- Ensure JSON is valid syntax
- Verify filename includes .mp4 extension

### Category Mismatch Error
- Ensure video is in correct directory (e.g., venues/9x16/)
- Check category field in JSON matches directory name
- Valid categories: venues, photographers, videographers, musicians, djs

### Upload Failed
- Check Bunny CDN API keys in environment variables
- Verify video file is valid MP4 format
- Ensure video file size is reasonable (< 100MB recommended)

## 📊 Library Status Check

To check what's currently in each library:
```bash
node scripts/check_9x16_venues.js
```

To clean/truncate all libraries:
```bash
node scripts/clean_category_libraries_9x16.js
```

## 🎯 Testing After Upload

1. **Check API Response**:
   ```
   https://media.synthetikmedia.ai/api/bunny-videos?device=mobile&category=venues
   ```

2. **Test Mobile Categories**:
   - https://media.synthetikmedia.ai/venues
   - https://media.synthetikmedia.ai/musicians
   - https://media.synthetikmedia.ai/photographers
   - etc.

3. **Verify Metadata**:
   - Category labels display correctly
   - Vendor information shows properly
   - Location data is accurate

## 📝 Example Upload Session

```bash
# 1. Add videos to directories
cp wedding_venue_1.mp4 /app/main/staging_app/input/venues/9x16/
cp musician_piano.mp4 /app/main/staging_app/input/musicians/9x16/

# 2. Update batch_videos.json with metadata

# 3. Run upload
node scripts/upload_from_staging_9x16.js

# Expected output:
# 📋 Loaded metadata for 2 9x16 videos from batch_videos.json
# 📁 Processing VENUES
# ✅ Uploaded: 1
# 📁 Processing MUSICIANS  
# ✅ Uploaded: 1
```

---
*Follow this guide to ensure consistent, reliable video uploads with proper metadata.*