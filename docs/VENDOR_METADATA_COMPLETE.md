# Complete Vendor Metadata System

## Overview
The video platform now supports comprehensive vendor metadata including name, location, website, and category - all stored in Bunny CDN metaTags for optimal performance.

## Metadata Fields

### Video Interface
```typescript
interface Video {
  // ... existing fields ...
  
  // Vendor Information
  category?: string         // "musicians", "photographers", etc.
  vendorName?: string       // "Golden Hour Studios"
  vendorWebsite?: string    // "www.goldenhourphotography.com"
  vendorCity?: string       // "Nashville"
  vendorState?: string      // "Tennessee"
  vendorZipcode?: string    // "37215"
}
```

### Bunny CDN MetaTags
When uploading videos to Bunny CDN, include these metaTags:
```json
{
  "category": "photographers",
  "city": "Nashville",
  "vendor": "Golden Hour Studios",        // Legacy field
  "vendorName": "Golden Hour Studios",    // Primary vendor name
  "vendorWebsite": "www.goldenhourphotography.com",
  "vendorCity": "Nashville",              // Vendor's city
  "state": "Tennessee",
  "zipcode": "37215",
  "tags": "wedding,photography,portrait"
}
```

## UI Display

### Category Badge (Top-left)
```html
<span class="text-sm font-medium capitalize">
  photographers
</span>
```

### Vendor Button (Bottom-center)
```html
<div class="vendor-button">
  <h3>Golden Hour Studios</h3>
  <span>Nashville, Tennessee</span>
  <span>www.goldenhourphotography.com</span>
</div>
```

## Data Flow

### 1. Video Upload (Staging App)
```python
# When uploading to Bunny CDN
metadata = {
    'title': 'Beautiful Wedding Photography',
    'category': 'photographers',
    'vendorName': 'Golden Hour Studios',
    'vendorWebsite': 'www.goldenhourphotography.com',
    'vendorCity': 'Nashville',
    'city': 'Nashville',  # Video location
    'state': 'Tennessee',
    'zipcode': '37215'
}
```

### 2. Bunny CDN Storage
- MetaTags are stored with the video in Bunny CDN
- Accessible via Bunny API instantly
- No additional database queries needed

### 3. API Response
```javascript
// GET /api/bunny-videos
{
  "success": true,
  "videos": [{
    "id": "video-123",
    "src": "https://cdn.bunnycdn.com/video.m3u8",
    "category": "photographers",
    "vendorName": "Golden Hour Studios",
    "vendorCity": "Nashville",
    "vendorState": "Tennessee",
    "vendorZipcode": "37215",
    "vendorWebsite": "www.goldenhourphotography.com",
    "metaTags": { /* original Bunny metaTags */ }
  }]
}
```

### 4. Frontend Display
The VideoScrollerFresh component automatically:
- Shows category in the top-left badge
- Displays vendor name prominently
- Shows city and state below vendor name
- Makes website clickable (opens in new tab)

## Performance Benefits

### Using Bunny CDN MetaTags
- ✅ **Single API call** - All data comes from Bunny CDN
- ✅ **CDN speed** - Served from edge locations globally
- ✅ **No database queries** - No need to join with Firebase
- ✅ **Instant updates** - Changes reflect immediately

### Comparison
```
Traditional: Client → API → Firebase → Response (100-200ms)
With Bunny:  Client → CDN → Response (20-50ms)
```

## Fallback Behavior

If videos don't have metaTags (older videos):
1. Vendor name extracted from description
2. Default city set to "Nashville"
3. Website generated from username
4. Category detected from video title

## Implementation Files

- **API**: `/src/app/api/bunny-videos/route.ts`
- **UI Component**: `/src/components/video/VideoScrollerFresh.tsx`
- **Upload Script**: `/staging_app/scripts/video_processor_v2.py`
- **Tests**: `/scripts/test_vendor_metadata_complete.js`

## Testing

### Check Current Videos
```bash
node scripts/test_vendor_metadata_complete.js
```

### Upload New Video with Metadata
```python
from scripts.video_processor_v2 import VideoProcessor

processor = VideoProcessor()
metadata = {
    'title': 'Garden Wedding Venue Tour',
    'category': 'venues',
    'vendorName': 'Rosewood Gardens',
    'vendorWebsite': 'www.rosewoodgardens.com',
    'vendorCity': 'Franklin',
    'city': 'Franklin',
    'state': 'Tennessee',
    'zipcode': '37064',
    'resolution': '16x9'
}
processor.process_video('path/to/video.mp4', metadata)
```

## Migration Strategy

### For Existing Videos
1. Videos without metaTags will use fallback data
2. Can bulk update via Bunny API to add metaTags
3. Or re-upload with proper metadata

### For New Videos
1. Always include full vendor metadata when uploading
2. Use staging app's video processor
3. Metadata automatically included in Bunny CDN

---
*Last Updated: January 21, 2025*
*Feature: Complete vendor metadata with location support*