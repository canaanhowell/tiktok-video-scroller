#!/bin/bash

echo "🚀 Starting Vercel deployment..."
echo ""

# Export token
export VERCEL_TOKEN="${vercel_token}"

# Check if token exists
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: Vercel token not found in environment"
    echo "Please ensure vercel_token is set"
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