# Video Implementation Guide - TikTok Video Scroller

> **⚠️ IMPORTANT**: This project has been cleaned up. Old buggy components have been removed.
> Only use the documented working solutions below.

## 🎯 Working Solution (July 2025)

### Primary Component: `VideoScrollerFresh.tsx`
**Location**: `src/components/video/VideoScrollerFresh.tsx`  
**Status**: ✅ PRODUCTION READY  
**Last Updated**: 2025-07-17

This is the **ONLY** video scroller component you should use. It has:
- ✅ Simplified HLS.js support for .m3u8 streams
- ✅ Native HLS fallback for Safari/iOS  
- ✅ Proper loading states and error handling
- ✅ Clean per-component lifecycle management
- ✅ Mobile-optimized touch controls

### Usage Example:
```typescript
import { VideoScrollerFresh } from '@/components/video/VideoScrollerFresh'

// In your page component
<VideoScrollerFresh
  videos={bunnyVideos}
  onVideoChange={handleVideoChange}
/>
```

### Video Data Format:
```typescript
interface Video {
  id: string
  src: string        // HLS stream URL (.m3u8) from Bunny CDN
  poster?: string
  username: string
  description: string
  likes: number
  comments: number
  shares: number
}
```

## 🚀 Deployment Process

### Working Deployment Method:
```bash
# Use the verified working deployment script
./scripts/deploy-production.sh
```

This script uses the correct Vercel token and deployment configuration that has been verified to work.

### Manual Deployment:
```bash
# If script fails, use this exact command:
vercel --prod --token ooa3rKLHeWAVOftf6EIS9sD3 --yes
```

## 🏗️ Technical Architecture

### HLS.js Configuration (Working):
```typescript
const hls = new Hls({
  enableWorker: false,              // Avoid complexity
  debug: false,                     // No debug noise  
  maxBufferLength: 20,              // Conservative buffering
  maxBufferSize: 30 * 1000 * 1000,  // 30MB limit
  manifestLoadingTimeOut: 10000,     // 10s timeout
  levelLoadingTimeOut: 10000,        // 10s timeout
  fragLoadingTimeOut: 20000,         // 20s timeout
})
```

### Key Principles:
1. **Per-Component Instances**: Each video manages its own HLS instance
2. **Proper Cleanup**: HLS instances destroyed on component unmount
3. **Fallback Support**: Native HLS for Safari/iOS
4. **Conservative Settings**: Reliable over performant
5. **Simple State Management**: Loading/error states only

## 🔧 Troubleshooting

### Common Issues & Solutions:

#### "The element has no supported sources"
**Cause**: Trying to use native video elements with HLS streams  
**Solution**: ✅ Already fixed in VideoScrollerFresh.tsx

#### "Endless buffering"
**Cause**: Complex global HLS instance management  
**Solution**: ✅ Already fixed with per-component instances

#### Build/TypeScript Errors
**Cause**: Missing HLS.js types or invalid config properties  
**Solution**: ✅ Already fixed with proper imports and config

### Debug Console Logs (Working):
```
[FRESH] Setting up video 1
[FRESH] Using HLS.js for video 1  
[FRESH] HLS ready for video 1
[FRESH] Playing video 1
```

## 🗂️ File Structure (Clean)

### Keep These Files:
```
src/components/video/
├── VideoScrollerFresh.tsx    ← PRIMARY COMPONENT (USE THIS)
├── VideoPlayer.tsx           ← Basic video player  
├── VideoControls.tsx         ← Video controls UI
├── QualitySelector.tsx       ← Quality selection
└── VolumeGesture.tsx         ← Volume gesture controls
```

### Removed (Buggy/Outdated):
- ❌ VideoScrollerSnap.tsx (complex global management)
- ❌ VideoScrollerDebug.tsx (overly complex debugging)
- ❌ VideoScrollerFixed.tsx (attempted fixes)
- ❌ All backup/ and tests/ directories
- ❌ Complex video library files in src/lib/video/

## 📱 Browser Support

| Browser | Method | Status |
|---------|--------|--------|
| Chrome | HLS.js | ✅ Working |
| Firefox | HLS.js | ✅ Working |  
| Safari | Native HLS | ✅ Working |
| iOS Safari | Native HLS | ✅ Working |
| Edge | HLS.js | ✅ Working |

## 🌐 CDN Configuration

### Bunny CDN (Working):
- **Format**: HLS (.m3u8) streams
- **Example URL**: `https://vz-97606b97-31d.b-cdn.net/{video-id}/playlist.m3u8`
- **Status**: ✅ Working (was never the problem)

### CORS Headers:
Bunny CDN is properly configured with CORS headers. No changes needed.

## 🔄 Development Workflow

### Making Changes:
1. ✅ Only modify `VideoScrollerFresh.tsx`
2. ✅ Test locally with `npm run dev`
3. ✅ Deploy with `./scripts/deploy-production.sh`
4. ✅ Verify at https://media.synthetikmedia.ai

### Adding Features:
- Add new props to VideoScrollerFresh interface
- Keep HLS.js configuration minimal and conservative
- Test on multiple browsers/devices
- Document changes in this README

## 🚨 Critical Notes

### ❌ DO NOT:
- Create new video scroller components
- Use global HLS instance management
- Import removed/deleted components
- Modify HLS.js configuration without testing
- Use native video elements for HLS streams

### ✅ DO:
- Use VideoScrollerFresh.tsx as the single source of truth
- Follow the working deployment process
- Keep HLS.js configuration simple
- Test on mobile devices
- Update this README when making changes

---

**Last Successful Deployment**: 2025-07-17 22:33 UTC  
**Production URL**: https://media.synthetikmedia.ai  
**Status**: ✅ WORKING IN PRODUCTION