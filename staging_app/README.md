# Staging App - Video Batch Upload System

This staging area is designed to organize and prepare videos for batch upload to the wedding vendor platform.

## Directory Structure

```
staging_app/
├── input/
│   ├── photographers/    # Place photographer showcase videos here
│   ├── venues/          # Place venue tour videos here
│   ├── videographers/   # Place videographer sample videos here
│   ├── musicians/       # Place musician performance videos here
│   ├── djs/            # Place DJ showcase videos here
│   ├── florists/       # Place florist portfolio videos here
│   ├── wedding-cakes/  # Place cake designer videos here
│   ├── bands/          # Place band performance videos here
│   └── batch_videos.json  # Auto-generated batch configuration
├── scan_and_update_batch.js  # Script to scan and update batch config
└── README.md           # This file
```

## How to Use

1. **Place Videos in Category Folders**
   - Copy or move video files into the appropriate category subfolder under `input/`
   - Videos should be in MP4, MOV, AVI, WEBM, or MKV format
   - Use descriptive filenames (e.g., `JohnSmithPhotography_portfolio_2025.mp4`)

2. **Update Batch Configuration**
   - Run the scan script to detect all videos and update `batch_videos.json`:
   ```bash
   node staging_app/scan_and_update_batch.js
   ```

3. **Review Generated Metadata**
   - Check `input/batch_videos.json` to review the auto-generated metadata
   - The script extracts vendor names from filenames and assigns appropriate categories
   - Default location is set to Los Angeles, CA - update as needed

## Filename Conventions

For best results, use these naming patterns:
- `VendorName_ServiceType_Date.mp4`
- `vendor-name_showcase_timestamp.mp4`
- `BusinessName_portfolio_2025.mp4`

The script will attempt to extract vendor information from the filename.

## Batch Videos JSON Structure

The `batch_videos.json` file contains:
- **batchInfo**: Scan timestamp and total video count
- **categories**: Each category with its default metadata and video list
- **videoTemplate**: Example structure for video entries

Each video entry includes:
- File information (name, path, size, modified date)
- Title and description
- Vendor metadata (name, category, location, services)
- Video metadata (tags, resolution, status)

## Customizing Metadata

Default vendor metadata for each category includes:
- Location (city, state, zipcode)
- Services offered
- Price range
- Verification status

You can edit `batch_videos.json` directly to customize vendor information before upload.

## Integration with Main App

The generated `batch_videos.json` can be used by upload scripts to:
- Create vendor profiles in Firebase
- Upload videos to Bunny CDN with proper categorization
- Associate videos with correct vendor metadata
- Maintain consistent data structure across the platform