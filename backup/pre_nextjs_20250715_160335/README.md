# TikTok-Style Video Scroller

A cross-platform responsive vertical video scroller that provides a seamless TikTok-like experience across all devices - mobile, tablet, and desktop.

## Features

- 📱 **Perfect Responsive Design**: Adapts flawlessly to any screen size (320px to 4K)
- 🎥 **Smooth Video Playback**: HLS streaming with adaptive quality
- 👆 **Gesture Support**: Swipe, tap, pinch, and more
- 🖱️ **Mouse & Keyboard**: Full desktop navigation support
- ⚡ **High Performance**: 60fps scrolling, optimized loading
- ♿ **Accessible**: WCAG AAA compliant with full keyboard navigation
- 🌐 **Cross-Browser**: Works on all modern browsers

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom responsive utilities
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Video CDN**: Bunny CDN (Storage + HLS Streaming)
- **Caching**: Upstash Redis (Serverless)
- **Video Player**: HLS.js for adaptive streaming
- **Gestures**: react-use-gesture
- **State**: React Context + Hooks
- **Testing**: Jest + Playwright
- **Deployment**: Vercel with custom domain

## Project Structure

```
web_app/
├── src/
│   ├── components/     # React components
│   │   ├── video/     # Video player components
│   │   ├── ui/        # UI components
│   │   └── layout/    # Layout components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── styles/        # Global styles
│   ├── pages/         # Next.js pages
│   └── api/           # API routes
├── public/            # Static assets
├── config/            # Configuration files
├── scripts/           # Build and utility scripts
├── tests/             # Test files
├── logs/              # Development logs
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Python 3.8+ (for logging scripts)

### Installation

```bash
# Clone the repository
cd /app/main/web_app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Production URL

The app is deployed at: **https://media.synthetikmedia.ai**

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start

# Check implementation progress
python scripts/track_progress.py
```

## Responsive Breakpoints

- `xs`: 320px (Small phones)
- `sm`: 640px (Large phones)  
- `md`: 768px (Tablets)
- `lg`: 1024px (Small desktops)
- `xl`: 1280px (Large desktops)
- `2xl`: 1536px (Very large screens)
- `3xl`: 1920px (4K displays)

## Performance Targets

- Load time: <2 seconds on all devices
- Smooth scrolling: 60fps minimum
- Core Web Vitals: All green
- Lighthouse score: 95+

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- iOS Safari 14+
- Chrome Mobile
- Samsung Internet

## Contributing

1. Check `docs/implementation_plan.md` for current progress
2. Use the logging system for all changes
3. Test on multiple devices before submitting
4. Follow the established code patterns
5. Update documentation as needed

## Scripts

- `scripts/logger.py` - Logging system for development
- `scripts/track_progress.py` - Track implementation progress

## Documentation

See the `docs/` directory for detailed documentation:
- `implementation_plan.md` - Full development roadmap
- `Web_App_Instructions` - Original project requirements

## License

Private project - All rights reserved