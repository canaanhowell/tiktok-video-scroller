# Credentials & Services Checklist

## Essential Services (Required to Start)

### 1. Video Storage & CDN
Choose one of the following:

#### Option A: AWS (Recommended for scale)
- [ ] AWS Account
- [ ] S3 Bucket for video storage
- [ ] CloudFront distribution for CDN
- [ ] IAM credentials with S3 permissions

#### Option B: Cloudinary (Easier setup)
- [ ] Cloudinary account (free tier available)
- [ ] API credentials
- [ ] Upload preset configured

#### Option C: Local Development
- [ ] Local video files in `public/videos/`
- [ ] No credentials needed for development

### 2. Database
Choose one:

#### Option A: PostgreSQL (Recommended)
- [ ] PostgreSQL instance (local or cloud)
- [ ] Database created
- [ ] Connection string

#### Option B: MongoDB
- [ ] MongoDB instance (local or Atlas)
- [ ] Database created
- [ ] Connection string

#### Option C: Local JSON (Development only)
- [ ] Mock data files
- [ ] No credentials needed

## Optional Services (Can Add Later)

### 3. Authentication
- [ ] NextAuth.js configuration
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] JWT secret

### 4. Video Processing
- [ ] Mux account for video streaming
- [ ] FFmpeg for local processing

### 5. Analytics & Monitoring
- [ ] Google Analytics
- [ ] Sentry for error tracking
- [ ] Vercel Analytics

### 6. Performance Monitoring
- [ ] New Relic or Datadog
- [ ] Custom performance tracking

### 7. Caching
- [ ] Redis instance
- [ ] Upstash for serverless Redis

### 8. Email Notifications
- [ ] SendGrid or similar
- [ ] Email templates

## Development Setup Options

### Minimal Setup (No External Services)
1. Use local video files
2. Use JSON files for data
3. No authentication
4. Local development only

### Basic Setup (Some Services)
1. Cloudinary for videos (free tier)
2. PostgreSQL local instance
3. Basic authentication

### Full Setup (Production-ready)
1. AWS S3 + CloudFront
2. Managed PostgreSQL
3. Full authentication
4. All monitoring services

## Questions to Answer:

1. **Video Storage**: Where will videos be stored?
   - Local files (development)
   - AWS S3
   - Cloudinary
   - Other cloud storage

2. **Database**: What database to use?
   - PostgreSQL
   - MongoDB
   - Local JSON files
   - Supabase
   - Firebase

3. **Authentication**: Is user login required?
   - No authentication
   - Email/password
   - Social OAuth
   - Magic links

4. **Video Source**: Where do videos come from?
   - Pre-uploaded files
   - User uploads
   - External API
   - Sample videos for demo

5. **Deployment Target**: Where will it be hosted?
   - Vercel (recommended for Next.js)
   - AWS
   - Self-hosted
   - Local only

## Recommended Minimum for Development:

1. **No external services needed** - We can start with:
   - Local video files in `public/videos/`
   - Mock JSON data for video metadata
   - No authentication initially
   - SQLite for local database

2. **Free tier services** if you want cloud features:
   - Cloudinary free tier (25 credits/month)
   - Supabase free tier (database + auth)
   - Vercel free tier (hosting)

## Next Steps:

Please let me know:
1. Do you have any existing cloud accounts (AWS, Google Cloud, etc.)?
2. Do you prefer to start with local development or set up cloud services?
3. Do you need user authentication features?
4. Where will the video content come from?
5. What's your deployment target?

Based on your answers, I'll help you set up only what's necessary to get started!