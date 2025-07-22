#!/bin/bash

# Script to update V1 project environment variables with all Bunny CDN credentials
# Run with: bash scripts/update_v1_env.sh

TOKEN="na3olUP2AJAn3rEpiWN2lh46"

echo "🚀 Adding ALL Bunny CDN environment variables to V1 project..."

# Array of all environment variables to add
declare -A env_vars=(
    # Photography
    ["bunny_cdn_video_streaming_hostname_photography_16x9"]="vz-704af8cf-669.b-cdn.net"
    ["bunny_cdn_video_streaming_key_photography_16x9"]="33029dab-5c10-4011-acb70be9a984-150e-4041"
    ["bunny_cdn_video_streaming_library_photography_9x16"]="469958"
    ["bunny_cdn_video_streaming_hostname_photography_9x16"]="vz-965c085b-e8d.b-cdn.net"
    ["bunny_cdn_video_streaming_key_photography_9x16"]="77e4f8a4-129b-4ef4-8f72a5e4dffd-f951-4342"
    
    # Musicians
    ["bunny_cdn_video_streaming_library_musicians_16x9"]="469971"
    ["bunny_cdn_video_streaming_hostname_musicians_16x9"]="vz-aeaf110d-728.b-cdn.net"
    ["bunny_cdn_video_streaming_key_musicians_16x9"]="5b2adb99-64b9-439b-93f7388e9899-9761-45fb"
    ["bunny_cdn_video_streaming_library_musicians_9x16"]="469970"
    ["bunny_cdn_video_streaming_hostname_musicians_9x16"]="vz-9bef5b70-a08.b-cdn.net"
    ["bunny_cdn_video_streaming_key_musicians_9x16"]="94095172-3d73-470c-b6976115ee04-f062-486f"
    
    # Videographers
    ["bunny_cdn_video_streaming_library_videographers_16x9"]="469965"
    ["bunny_cdn_video_streaming_hostname_videographers_16x9"]="vz-3ab70028-1ac.b-cdn.net"
    ["bunny_cdn_video_streaming_key_videographers_16x9"]="d0754b35-fa96-40d9-b72f3f0e51a8-244b-495e"
    ["bunny_cdn_video_streaming_library_videographers_9x16"]="469964"
    ["bunny_cdn_video_streaming_hostname_videographers_9x16"]="vz-ca34d76f-d5f.b-cdn.net"
    ["bunny_cdn_video_streaming_key_videographers_9x16"]="81b7b97d-9e02-4c00-9b4b94626029-c6e7-46f8"
    
    # DJs
    ["bunny_cdn_video_streaming_library_dj_16x9"]="469973"
    ["bunny_cdn_video_streaming_hostname_dj_16x9"]="vz-5052a117-bbc.b-cdn.net"
    ["bunny_cdn_video_streaming_key_dj_16x9"]="a06c2983-bdbf-4312-8a6b90ac6f65-888d-4921"
    ["bunny_cdn_video_streaming_library_dj_9x16"]="469972"
    ["bunny_cdn_video_streaming_hostname_dj_9x16"]="vz-3cdaae6e-a6b.b-cdn.net"
    ["bunny_cdn_video_streaming_key_dj_9x16"]="212e9949-c822-4a2d-88f999d57972-d4c5-46c1"
    
    # Venues
    ["bunny_cdn_video_streaming_library_venues_16x9"]="469968"
    ["bunny_cdn_video_streaming_hostname_venues_16x9"]="vz-80cd40aa-6f0.b-cdn.net"
    ["bunny_cdn_video_streaming_key_venues_16x9"]="43946146-474c-472a-98a8eab0039e-c8d0-46d1"
    ["bunny_cdn_video_streaming_library_venues_9x16"]="469966"
    ["bunny_cdn_video_streaming_hostname_venues_9x16"]="vz-c0ef2cec-a20.b-cdn.net"
    ["bunny_cdn_video_streaming_key_venues_9x16"]="aacb61e1-ac77-454b-a0aeeeb23391-f320-48c7"
    
    # Default libraries (updated names)
    ["bunny_cdn_video_streaming_library_9x16"]="467029"
    ["bunny_cdn_video_streaming_hostname_9x16"]="vz-97606b97-31d.b-cdn.net"
    ["bunny_cdn_video_streaming_key_9x16"]="931f28b3-fc95-4659-a29300277c12-1643-4c31"
    ["bunny_cdn_video_streaming_library_16x9"]="469922"
    ["bunny_cdn_video_streaming_hostname_16x9"]="vz-b123ebaa-cf2.b-cdn.net"
    ["bunny_cdn_video_streaming_key_16x9"]="6b9d2bc6-6ad4-47d1-9fbc96134fc8-c5dc-4643"
)

# Add all environment variables
for var_name in "${!env_vars[@]}"; do
    value="${env_vars[$var_name]}"
    echo "Adding $var_name..."
    echo "$value" | vercel --token $TOKEN env add "$var_name" production > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Added $var_name"
    else
        echo "❌ Failed to add $var_name"
    fi
done

echo ""
echo "✅ All environment variables have been added to tiktok-video-scroller_v1!"
echo "🔄 Deploy the V1 project to pick up the new environment variables."