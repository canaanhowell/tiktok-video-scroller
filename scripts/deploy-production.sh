#!/bin/bash

# Production Deployment Script
# This script uses the VERIFIED WORKING deployment method
# Last successful deployment: 2025-07-16

echo "🚀 Starting Production Deployment"
echo "================================"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from web_app directory"
    exit 1
fi

# The WORKING deployment command
# Token: ooa3rKLHeWAVOftf6EIS9sD3 (from .env.local Vercel_token)
echo "📦 Building and deploying to Vercel..."

# Run the exact command that worked
vercel --prod --token ooa3rKLHeWAVOftf6EIS9sD3 --yes

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "URLs:"
    echo "- Production: https://media.synthetikmedia.ai"
    echo "- Dashboard: https://vercel.com/dashboard"
    echo ""
    
    # Log the deployment
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Production deployment successful via CLI" >> logs/deployment.log
else
    echo "❌ Deployment failed!"
    echo "Please check the error messages above"
    exit 1
fi