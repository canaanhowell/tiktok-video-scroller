#!/bin/bash

echo "🚀 Starting Vercel deployment..."
echo ""

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -E '^Vercel_token=' .env | xargs)
fi

# Use the correct token variable name (Vercel_token with lowercase 't')
VERCEL_TOKEN="${Vercel_token}"

# Check if token exists
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: Vercel token not found"
    echo "Please ensure 'Vercel_token' is set in .env"
    exit 1
fi

echo "📦 Building and deploying to production..."
echo ""

# Deploy using npx to ensure we use the right version
npx vercel@latest deploy --prod --yes --token="$VERCEL_TOKEN"

echo ""
echo "✅ Deployment command executed"
echo ""
echo "🔍 Check deployment status at: https://vercel.com/dashboard"
echo "🌐 Production URL: https://media.synthetikmedia.ai"