# Current Tech Stack - TikTok Video Scroller

## ✅ Confirmed Services & Technologies

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Responsive styling
- **Framer Motion** - Animations
- **HLS.js** - Video streaming player
- **react-use-gesture** - Touch/mouse gestures

### Backend & Database
- **Supabase** (PostgreSQL)
  - Database for video metadata, users, interactions
  - Built-in authentication (social + email)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Project URL: `https://aanszwtmjvfskdettlxm.supabase.co`

### Video Infrastructure
- **Bunny CDN**
  - Video storage zone: `trueharmonic`
  - HLS streaming library: `467029`
  - Global CDN delivery
  - Automatic video optimization
  - Hostname: `vz-97606b97-31d.b-cdn.net`

### Caching & Performance
- **Upstash Redis**
  - Serverless Redis
  - View count caching
  - Rate limiting
  - Session management
  - Endpoint: `wealthy-moose-10185.upstash.io`

### Deployment & Hosting
- **Vercel**
  - Next.js optimized hosting
  - Edge functions
  - Automatic SSL
  - Preview deployments
  - Domain: `https://media.synthetikmedia.ai`

### Development Tools
- **GitHub**
  - Version control
  - CI/CD with GitHub Actions
  - Repository: `canaanhowell/tiktok-video-scroller`

### CLI Tools Installed
- **Vercel CLI** - Deployment and local dev
- **Supabase CLI** (via npx) - Database management
- **GitHub CLI** - Repository management

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                     │
│  - React Components    - Tailwind CSS    - TypeScript       │
│  - HLS.js Player      - Gesture Handling - Responsive Design│
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
                  ▼                       ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│    Bunny CDN (Videos)   │     │    Supabase (Database)      │
│  - HLS Streaming        │     │  - PostgreSQL               │
│  - Global CDN           │     │  - Authentication           │
│  - Video Storage        │     │  - Real-time Updates        │
└─────────────────────────┘     └──────────┬──────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────────────┐
                                │   Upstash Redis (Cache)     │
                                │  - View Counts              │
                                │  - Rate Limiting            │
                                │  - Session Data             │
                                └─────────────────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────────────┐
                                │     Vercel (Hosting)        │
                                │  - Edge Network             │
                                │  - Serverless Functions     │
                                │  - Auto SSL                 │
                                └─────────────────────────────┘
```

## Data Flow

1. **Video Upload Flow**
   ```
   User Upload → API → Bunny CDN Storage → HLS Processing → CDN Distribution
   ```

2. **Video Playback Flow**
   ```
   Client Request → Check Redis Cache → Fetch from Supabase → Stream from Bunny CDN
   ```

3. **User Interaction Flow**
   ```
   User Action → API Route → Update Supabase → Invalidate Redis → Real-time Update
   ```

## Environment Variables Configuration

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://aanszwtmjvfskdettlxm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_KEY=[configured]

# Bunny CDN
BUNNY_STORAGE_ZONE=trueharmonic
BUNNY_STORAGE_KEY=[configured]
BUNNY_STREAMING_LIBRARY=467029
NEXT_PUBLIC_BUNNY_STREAMING_HOSTNAME=vz-97606b97-31d.b-cdn.net
BUNNY_STREAMING_KEY=[configured]
BUNNY_ADMIN_KEY=[configured]

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://wealthy-moose-10185.upstash.io
UPSTASH_REDIS_REST_TOKEN=[configured]

# Vercel
VERCEL_PROJECT_ID=prj_n2wkROJ6OcyYdtZI2uF0Ra4MLJHk
VERCEL_TOKEN=[configured]

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=https://media.synthetikmedia.ai
```

## Database Schema (Supabase)

```sql
-- Users table (managed by Supabase Auth)
-- Automatic with Supabase Auth

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Views table (cached in Redis)
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Routes Structure

```
/app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── callback/route.ts
├── videos/
│   ├── route.ts (GET all, POST new)
│   ├── [id]/route.ts (GET one, PUT, DELETE)
│   ├── [id]/like/route.ts
│   ├── [id]/comment/route.ts
│   └── [id]/view/route.ts
├── upload/
│   ├── route.ts (Handle video upload)
│   └── presigned/route.ts (Bunny CDN presigned URL)
└── users/
    ├── profile/route.ts
    └── settings/route.ts
```

## Key Features Enabled by Stack

1. **Scalability**
   - Bunny CDN handles millions of video views
   - Supabase scales automatically
   - Vercel Edge Network for global performance

2. **Real-time Features**
   - Live view counts via Supabase Realtime
   - Instant comment updates
   - Real-time likes

3. **Performance**
   - Redis caching for instant data
   - CDN edge caching for videos
   - Optimized HLS streaming

4. **Security**
   - Supabase RLS for data protection
   - Secure video URLs from Bunny CDN
   - Vercel automatic SSL

## Development Workflow

```bash
# Local development
npm run dev

# Database migrations
npx supabase db diff --name "migration_name"
npx supabase db push

# Deploy to production
vercel --prod

# Environment sync
vercel env pull .env.local
```

This tech stack provides enterprise-grade infrastructure for a TikTok-style video platform with excellent performance, scalability, and developer experience.