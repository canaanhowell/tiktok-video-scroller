#!/bin/bash

echo "🔍 Testing Production API Endpoints"
echo "=================================="

BASE_URL="https://tiktok-video-scroller-gbilx542s-canaan-howells-projects.vercel.app"

echo -e "\n1️⃣ Testing vendor search API..."
curl -s "${BASE_URL}/api/vendors/search?category=musicians" | jq '.' || echo "Failed to fetch vendors"

echo -e "\n2️⃣ Testing vendor stats API..."
curl -s "${BASE_URL}/api/vendors/stats" | jq '.' || echo "Failed to fetch stats"

echo -e "\n3️⃣ Testing videos API..."
curl -s "${BASE_URL}/api/videos?category=musicians" | jq '.' || echo "Failed to fetch videos"

echo -e "\n4️⃣ Testing ZIP code search..."
curl -s "${BASE_URL}/api/vendors/search?zipcode=37215" | jq '.' || echo "Failed to search by ZIP"

echo -e "\n✨ API test complete!"