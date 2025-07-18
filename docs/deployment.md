# Deployment Guide

This document outlines the proper method for deploying the True Harmonic web application to production.

## Prerequisites

- Node.js installed (v20.15.1 or later)
- npm installed
- Vercel CLI installed globally (`npm i -g vercel`)
- Access to the project's Vercel account

## Deployment Methods

### Method 1: Using npm Script (Recommended)

The easiest and most reliable way to deploy is using the pre-configured npm script:

```bash
npm run deploy:prod
```

This command uses the stored Vercel token and automatically deploys to production with the `--yes` flag to skip prompts.

### Method 2: Manual Vercel Deployment

If you need more control over the deployment:

```bash
# Build the project first
npm run build

# Deploy to production
vercel --prod --token ooa3rKLHeWAVOftf6EIS9sD3 --yes
```

### Method 3: Preview Deployment

For testing changes before production:

```bash
vercel --token ooa3rKLHeWAVOftf6EIS9sD3
```

This creates a preview deployment with a unique URL.

## Pre-deployment Checklist

1. **Build Locally**: Always test the build locally first
   ```bash
   npm run build
   ```

2. **Type Check**: Ensure TypeScript types are correct
   ```bash
   npm run type-check
   ```

3. **Test Locally**: Run the development server and verify changes
   ```bash
   npm run dev
   ```

4. **Commit Changes**: Ensure all changes are committed
   ```bash
   git add -A
   git commit -m "Your descriptive commit message"
   ```

## Deployment Configuration

The project uses the following Vercel configuration:

- **Project ID**: `prj_6fVvNO2KaH7SQpgYTktl5SCbuDUr`
- **Organization ID**: `team_0AAEifRDyAVs81WKiaV09kD8`
- **Framework**: Next.js 15.4.1
- **Build Command**: `next build`
- **Output Directory**: `.next`

## Environment Variables

The following environment variables are configured in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

These are automatically available during the build process.

## Post-deployment Verification

After deployment:

1. Check the deployment URL provided by Vercel
2. Verify all pages load correctly
3. Test video playback functionality
4. Ensure all navigation works properly
5. Verify colors and styling are correct

## Troubleshooting

### Authentication Issues

If you see authentication errors:
```bash
Error: No existing credentials found. Please run `vercel login` or pass "--token"
```

Use the npm script method or include the token explicitly.

### Build Failures

If the build fails:
1. Check the build logs in the Vercel dashboard
2. Ensure all dependencies are listed in `package.json`
3. Verify TypeScript types with `npm run type-check`
4. Check for missing environment variables

### Styling Issues

If Tailwind styles aren't working:
1. Ensure the `tailwind.config.ts` content array includes all file paths
2. Check that custom colors are properly defined
3. Rebuild locally to test: `npm run build`

## Production URL

The current production deployment is available at:
https://tiktok-video-scroller-evsnmokhl-canaan-howells-projects.vercel.app

## Additional Scripts

The project includes several deployment-related scripts in `package.json`:

- `deploy`: Node.js deployment script
- `deploy:bash`: Bash deployment script
- `deploy:prod`: Production deployment with token
- `deploy:working`: Alternative deployment script

Always prefer `npm run deploy:prod` for consistency.