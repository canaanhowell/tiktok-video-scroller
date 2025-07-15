#!/usr/bin/env node

console.log('🔍 Quick Vercel Deployment Check\n');

console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Find your project (tiktok-video-scroller or media.synthetikmedia.ai)');
console.log('3. Check the following:\n');

console.log('📋 DEPLOYMENT CHECKLIST:');
console.log('[ ] Latest deployment shows commit: "Fix TypeScript errors in bunny upload service"');
console.log('[ ] Deployment time is within last 30 minutes');
console.log('[ ] Deployment status is "Ready" (green)');
console.log('[ ] No error messages in deployment');

console.log('\n🔑 ENVIRONMENT VARIABLES (Settings → Environment Variables):');
console.log('[ ] bunny_cdn_streaming_library = 467029');
console.log('[ ] bunny_cdn_streaming_key = (your API key)');
console.log('[ ] bunny_cdn_streaming_hostname = vz-97606b97-31d.b-cdn.net');

console.log('\n🚨 IF DEPLOYMENT IS OLD OR MISSING:');
console.log('1. Click "Deployments" tab');
console.log('2. Find the latest commit from GitHub');
console.log('3. Click the 3 dots menu → "Redeploy"');
console.log('4. UNCHECK "Use existing Build Cache"');
console.log('5. Click "Redeploy"');

console.log('\n🚨 IF ENVIRONMENT VARIABLES ARE MISSING:');
console.log('1. Go to Settings → Environment Variables');
console.log('2. Click "Add New"');
console.log('3. Add each variable with the values above');
console.log('4. Make sure to select all environments (Production, Preview, Development)');
console.log('5. Click "Save"');
console.log('6. Then redeploy the project');

console.log('\n✅ After fixing, the site should show:');
console.log('- "Video 1 from input folder 🎥"');
console.log('- "Video 2 from input folder 🎬"');
console.log('- NOT "Demo content" or stock videos');