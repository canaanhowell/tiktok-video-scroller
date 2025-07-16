# Verified Service Connection Methods

This document contains the tested and verified methods for connecting to all services in the tech stack. These patterns have been confirmed to work as of July 16, 2025.

## 🔐 Environment Variable Reference

The following are the **exact** environment variable names used in `.env.local`:

### Vercel
- `Vercel_token` - Note the lowercase 't' in token
- `VERCEL_PROJECT_ID` - All caps

### Bunny CDN
- `bunny_cdn_streaming_key` - Your Bunny Stream API key
- `bunny_cdn_streaming_library` - Library ID (e.g., 467029)
- `bunny_cdn_streaming_hostname` - CDN hostname (e.g., vz-97606b97-31d.b-cdn.net)
- `bunny_cdn_admin_key` - Admin API key
- `bunny_cdn_storage_key` - Storage zone API key
- `bunny_cdn_storage_zone` - Storage zone name

### Supabase
- `Supabase_project_url` - Note the capital 'S' and space at the end
- `supabase_project_api` - Anon/public key with space at the end
- `supabase_admin_token` - Service role key with space at the end

### Upstash Redis
- `Redis_HTTPS_Endpoint` - HTTPS endpoint with space at the end
- `Redis_TCP_Endpoint` - TCP endpoint with space at the end
- `Upstash_Redis__Token` - Note the double underscore
- `upstash_api_key` - API key for management

### GitHub
- `GITHUB_USERNAME` - Your GitHub username
- `GITHUB_PAT` - Personal Access Token

## ✅ Verified Connection Methods

### 1. Vercel Deployment

```bash
# Correct deployment command (tested and working)
vercel --prod --token ooa3rKLHeWAVOftf6EIS9sD3 --yes

# Using environment variable
export VERCEL_TOKEN=$(grep Vercel_token .env.local | cut -d'=' -f2 | tr -d ' ')
vercel --prod --token "$VERCEL_TOKEN" --yes
```

**JavaScript:**
```javascript
const { exec } = require('child_process');
const config = {
  token: process.env.Vercel_token,
  projectId: process.env.VERCEL_PROJECT_ID
};

const deployCommand = `vercel --prod --token ${config.token} --yes`;
```

### 2. Bunny CDN Video Upload

```javascript
// Correct headers and endpoint
const BUNNY_CONFIG = {
  libraryId: process.env.bunny_cdn_streaming_library?.trim(), // Remove trailing space
  apiKey: process.env.bunny_cdn_streaming_key,
  hostname: process.env.bunny_cdn_streaming_hostname
};

// Create video
const response = await fetch(
  `https://video.bunnycdn.com/library/${BUNNY_CONFIG.libraryId}/videos`,
  {
    method: 'POST',
    headers: {
      'AccessKey': BUNNY_CONFIG.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Video Title' })
  }
);

// Upload video
const uploadUrl = `https://video.bunnycdn.com/library/${BUNNY_CONFIG.libraryId}/videos/${videoId}`;
```

### 3. Supabase Connection

```javascript
// Note: Always trim() the values due to trailing spaces
const SUPABASE_CONFIG = {
  url: process.env.Supabase_project_url?.trim(),
  anonKey: process.env.supabase_project_api?.trim(),
  serviceKey: process.env.supabase_admin_token?.trim()
};

// Using Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceKey || SUPABASE_CONFIG.anonKey
);
```

### 4. Upstash Redis Connection

```javascript
// REST API approach (recommended)
const REDIS_CONFIG = {
  url: process.env.Redis_HTTPS_Endpoint?.trim(),
  token: process.env.Upstash_Redis__Token?.trim()
};

// Make requests
const response = await fetch(`${REDIS_CONFIG.url}/ping`, {
  headers: {
    'Authorization': `Bearer ${REDIS_CONFIG.token}`
  }
});

// Using @upstash/redis client
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: REDIS_CONFIG.url,
  token: REDIS_CONFIG.token
});
```

### 5. GitHub CLI

```bash
# Already authenticated globally
gh auth status

# API operations
gh api repos/:owner/:repo

# No token needed in scripts - uses system auth
```

## 🔧 Utility Scripts

### Service Configuration Manager
Location: `/scripts/service-config.js`

```javascript
const { serviceConfig, validateServiceConfig } = require('./service-config');

// Get verified configuration for any service
const vercelConfig = validateServiceConfig('vercel');
const bunnyConfig = validateServiceConfig('bunnyCdn');
```

### Test All Services
Location: `/scripts/test-all-services.js`

```bash
# Run comprehensive service tests
node scripts/test-all-services.js
```

### Deploy to Vercel
Location: `/scripts/deploy-vercel.js`

```bash
# Deploy using verified configuration
node scripts/deploy-vercel.js
```

## 🚨 Common Issues and Solutions

### Issue: Vercel deployment fails with "token not found"
**Solution:** The token variable is `Vercel_token` (lowercase 't'), not `VERCEL_TOKEN`

### Issue: Bunny CDN returns 401 Unauthorized
**Solution:** Use `bunny_cdn_streaming_key`, not `bunny_cdn_admin_key` for video operations

### Issue: Environment variables have trailing spaces
**Solution:** Always use `.trim()` when reading these variables:
- `bunny_cdn_streaming_library`
- `Supabase_project_url`
- `supabase_project_api`
- `supabase_admin_token`
- `Redis_HTTPS_Endpoint`
- `Upstash_Redis__Token`

### Issue: Redis connection fails
**Solution:** Use the HTTPS endpoint with REST API, not the TCP endpoint

## 📝 Environment File Template

```env
# Vercel (note lowercase 't' in token)
Vercel_token=your_vercel_token_here
VERCEL_PROJECT_ID=prj_your_project_id

# Bunny CDN
bunny_cdn_streaming_key=your_streaming_key
bunny_cdn_streaming_library=467029
bunny_cdn_streaming_hostname=vz-xxxxxxxx-xxx.b-cdn.net
bunny_cdn_admin_key=your_admin_key
bunny_cdn_storage_key=your_storage_key
bunny_cdn_storage_zone=your_zone_name

# Supabase (note trailing spaces in actual file)
Supabase_project_url=https://your-project.supabase.co
supabase_project_api=your_anon_key
supabase_admin_token=your_service_role_key

# Upstash Redis
Redis_HTTPS_Endpoint=https://your-redis.upstash.io
Upstash_Redis__Token=your_redis_token
upstash_api_key=your_api_key

# GitHub
GITHUB_USERNAME=your_username
GITHUB_PAT=your_personal_access_token
```

## 🔄 Last Updated
July 16, 2025 - All connection methods tested and verified