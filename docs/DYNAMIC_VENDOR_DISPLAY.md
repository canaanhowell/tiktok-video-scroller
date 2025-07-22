# Dynamic Vendor & Category Display

## Overview
The video player now dynamically displays vendor information and categories for each video, replacing the hardcoded placeholders.

## What's Changed

### 1. Category Badge (Top-left of video)
- **Before**: Always showed "Photographers"
- **Now**: Shows actual category from `video.category`
- **Examples**: "musicians", "photographers", "videographers", "venues", "djs"

### 2. Vendor Button (Bottom-center of video)
- **Before**: 
  - Title: "Explore Vendor"
  - Website: "example.com"
- **Now**:
  - Title: Actual vendor name from `video.vendorName`
  - Website: Links to `video.vendorWebsite`
  - Opens vendor website in new tab

## Data Flow

```
Bunny CDN API → Video Metadata → VideoScrollerFresh Component → Dynamic Display
```

### Video Interface
```typescript
interface Video {
  // ... existing fields ...
  category?: string        // "musicians", "venues", etc.
  vendorName?: string      // "Golden Hour Photography"
  vendorWebsite?: string   // "www.goldenhourphotography.com"
}
```

### API Response Example
```json
{
  "id": "video-123",
  "src": "https://cdn.example.com/video.m3u8",
  "category": "photographers",
  "vendorName": "Golden Hour Photography",
  "vendorWebsite": "www.goldenhourphotography.com",
  "description": "Golden Hour Photography - Capturing moments that last forever 📸"
}
```

## Fallback Logic

The component includes smart fallbacks for missing data:

1. **Vendor Name**:
   - Primary: `video.vendorName`
   - Fallback: Extract from `video.description` (splits on " - ")
   - Default: "Explore Vendor"

2. **Vendor Website**:
   - Primary: `video.vendorWebsite`
   - Fallback: `{username}.com`
   - Default: "#" (no link)

3. **Category**:
   - If missing, the category badge won't display

## Testing

Run the test script to verify metadata:
```bash
node scripts/test_video_metadata_integration.js
```

## Future Enhancements

1. **Firebase Integration**: Currently using mock vendor data from Bunny API. Can be enhanced to fetch real vendor data from Firebase.

2. **Vendor Profiles**: Link to full vendor profile pages instead of external websites.

3. **Multiple Vendors**: Support for videos with multiple vendors (e.g., photographer + musician).

4. **Category Icons**: Add icons for each category type.

## Implementation Files

- **Component**: `/src/components/video/VideoScrollerFresh.tsx`
- **API**: `/src/app/api/bunny-videos/route.ts`
- **Test**: `/scripts/test_video_metadata_integration.js`

---
*Last Updated: January 21, 2025*