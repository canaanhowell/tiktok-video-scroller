# Deployment Configuration

## Production Domain
- **URL**: https://media.synthetikmedia.ai
- **Type**: Subdomain of synthetikmedia.ai
- **SSL**: Automatically handled by Vercel

## Vercel Domain Configuration

To connect your subdomain to Vercel:

1. **Add domain in Vercel**:
   ```bash
   vercel domains add media.synthetikmedia.ai
   ```

2. **DNS Configuration** (add to your domain provider):
   ```
   Type: CNAME
   Name: media
   Value: cname.vercel-dns.com
   ```

   OR if using A records:
   ```
   Type: A
   Name: media
   Value: 76.76.21.21
   ```

3. **Verify domain**:
   ```bash
   vercel domains inspect media.synthetikmedia.ai
   ```

## Environment Variables for Production

Update these in Vercel dashboard or via CLI:

```bash
# Set production URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://media.synthetikmedia.ai

# Set other production variables
vercel env add NODE_ENV production
# Enter: production
```

## CORS Configuration for Bunny CDN

Since your app is at `media.synthetikmedia.ai`, configure Bunny CDN CORS:

1. Go to Bunny CDN Panel
2. Navigate to your Pull Zone
3. Add CORS header:
   ```
   Access-Control-Allow-Origin: https://media.synthetikmedia.ai
   ```

## SSL and Security Headers

Vercel automatically provides:
- SSL certificate
- HSTS headers
- Security headers

Additional headers can be configured in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## Deployment Commands

```bash
# Deploy to production with custom domain
vercel --prod

# Set alias after deployment
vercel alias set [deployment-url] media.synthetikmedia.ai
```

## Monitoring

Your app will be accessible at:
- **Production**: https://media.synthetikmedia.ai
- **Preview**: https://[project-name].vercel.app
- **Development**: http://localhost:3000