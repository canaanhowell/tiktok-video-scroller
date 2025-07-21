# Deployment Guide

## ✅ VERIFIED WORKING METHOD (Last tested: 2025-07-16)

### Quick Deploy
```bash
# From web_app directory:
./scripts/deploy-production.sh
```

### Manual Deploy
```bash
vercel --prod --token ooa3rKLHeWAVOftf6EIS9sD3 --yes
```

## Important Notes

1. **Token Location**: The Vercel token is stored in `.env` as `Vercel_token` (note the capital V and lowercase t)
2. **Working Token**: `ooa3rKLHeWAVOftf6EIS9sD3`
3. **Do NOT use**: `npm run deploy` - it has issues with environment variable detection

## Deployment URLs

- **Production**: https://media.synthetikmedia.ai
- **Vercel Dashboard**: https://vercel.com/canaan-howells-projects/tiktok-video-scroller

## Troubleshooting

### "Token not valid" Error
The token in `.env` must be exactly: `Vercel_token=ooa3rKLHeWAVOftf6EIS9sD3`

### Auto-deployment from GitHub not working
Use the manual CLI deployment method above. GitHub integration may have issues.

### Verifying Deployment
Check for version markers in the code (e.g., `[v2]` after usernames) to confirm new code is deployed.

## Build & Deploy Process

1. **Build locally first** (optional):
   ```bash
   npm run build
   ```

2. **Deploy to production**:
   ```bash
   vercel --prod --token ooa3rKLHeWAVOftf6EIS9sD3 --yes
   ```

3. **Check deployment**:
   - Visit https://media.synthetikmedia.ai
   - Verify version markers or new features

## Environment Variables

Required in `.env`:
```
Vercel_token=ooa3rKLHeWAVOftf6EIS9sD3
VERCEL_PROJECT_ID=prj_n2wkROJ6OcyYdtZI2uF0Ra4MLJHk
```

## Common Issues & Solutions

1. **Videos not playing**: Usually means old code is cached. Force deploy with CLI.
2. **403 errors on videos**: Check Bunny CDN configuration, not deployment issue.
3. **Build errors**: Run `npm install` first, then try again.