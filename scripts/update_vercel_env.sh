#!/bin/bash

# Script to update Vercel environment variables with Bunny CDN credentials
# Run with: bash scripts/update_vercel_env.sh

TOKEN="ooa3rKLHeWAVOftf6EIS9sD3"

echo "🚀 Updating Vercel environment variables with Bunny CDN credentials..."

# Function to add environment variable
add_env_var() {
    local name=$1
    local value=$2
    echo "Adding $name with value $value..."
    echo "$value" | vercel --token $TOKEN env add "$name" production
}

# Photography Libraries
echo "📸 Adding Photography libraries..."
add_env_var "bunny_cdn_video_streaming_library_photography_16x9" "469957"
add_env_var "bunny_cdn_video_streaming_hostname_photography_16x9" "vz-704af8cf-669.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_photography_16x9" "33029dab-5c10-4011-acb70be9a984-150e-4041"
add_env_var "bunny_cdn_video_streaming_library_photography_9x16" "469958"
add_env_var "bunny_cdn_video_streaming_hostname_photography_9x16" "vz-965c085b-e8d.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_photography_9x16" "77e4f8a4-129b-4ef4-8f72a5e4dffd-f951-4342"

# Venues Libraries
echo "🏛️ Adding Venues libraries..."
add_env_var "bunny_cdn_video_streaming_library_venues_16x9" "469968"
add_env_var "bunny_cdn_video_streaming_hostname_venues_16x9" "vz-80cd40aa-6f0.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_venues_16x9" "43946146-474c-472a-98a8eab0039e-c8d0-46d1"
add_env_var "bunny_cdn_video_streaming_library_venues_9x16" "469966"
add_env_var "bunny_cdn_video_streaming_hostname_venues_9x16" "vz-c0ef2cec-a20.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_venues_9x16" "aacb61e1-ac77-454b-a0aeeeb23391-f320-48c7"

# Videographers Libraries
echo "🎥 Adding Videographers libraries..."
add_env_var "bunny_cdn_video_streaming_library_videographers_16x9" "469965"
add_env_var "bunny_cdn_video_streaming_hostname_videographers_16x9" "vz-3ab70028-1ac.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_videographers_16x9" "d0754b35-fa96-40d9-b72f3f0e51a8-244b-495e"
add_env_var "bunny_cdn_video_streaming_library_videographers_9x16" "469964"
add_env_var "bunny_cdn_video_streaming_hostname_videographers_9x16" "vz-ca34d76f-d5f.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_videographers_9x16" "81b7b97d-9e02-4c00-9b4b94626029-c6e7-46f8"

# Musicians Libraries
echo "🎵 Adding Musicians libraries..."
add_env_var "bunny_cdn_video_streaming_library_musicians_16x9" "469971"
add_env_var "bunny_cdn_video_streaming_hostname_musicians_16x9" "vz-aeaf110d-728.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_musicians_16x9" "5b2adb99-64b9-439b-93f7388e9899-9761-45fb"
add_env_var "bunny_cdn_video_streaming_library_musicians_9x16" "469970"
add_env_var "bunny_cdn_video_streaming_hostname_musicians_9x16" "vz-9bef5b70-a08.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_musicians_9x16" "94095172-3d73-470c-b6976115ee04-f062-486f"

# DJs Libraries
echo "🎧 Adding DJs libraries..."
add_env_var "bunny_cdn_video_streaming_library_dj_16x9" "469973"
add_env_var "bunny_cdn_video_streaming_hostname_dj_16x9" "vz-5052a117-bbc.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_dj_16x9" "a06c2983-bdbf-4312-8a6b90ac6f65-888d-4921"
add_env_var "bunny_cdn_video_streaming_library_dj_9x16" "469972"
add_env_var "bunny_cdn_video_streaming_hostname_dj_9x16" "vz-3cdaae6e-a6b.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_dj_9x16" "212e9949-c822-4a2d-88f999d57972-d4c5-46c1"

# Florists Libraries
echo "🌸 Adding Florists libraries..."
add_env_var "bunny_cdn_video_streaming_library_florists_16x9" "470102"
add_env_var "bunny_cdn_video_streaming_hostname_florists_16x9" "vz-49bfca1c-99c.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_florists_16x9" "24390b80-e022-4cff-9ce2bef5a5bc-31d3-41f1"
add_env_var "bunny_cdn_video_streaming_library_florists_9x16" "470101"
add_env_var "bunny_cdn_video_streaming_hostname_florists_9x16" "vz-b478a9c0-933.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_florists_9x16" "b450812e-6e4d-4aea-828d1d5b9b20-052e-4968"

# Wedding Cakes Libraries
echo "🎂 Adding Wedding Cakes libraries..."
add_env_var "bunny_cdn_video_streaming_library_wedding_cakes_16x9" "470104"
add_env_var "bunny_cdn_video_streaming_hostname_wedding_cakes_16x9" "vz-c52337e6-046.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_wedding_cakes_16x9" "7ec31936-79b8-4caa-ab953e2d10b3-cc7a-4291"
add_env_var "bunny_cdn_video_streaming_library_wedding_cakes_9x16" "470103"
add_env_var "bunny_cdn_video_streaming_hostname_wedding_cakes_9x16" "vz-e557c2ae-fc0.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_wedding_cakes_9x16" "a3b0945e-6bde-4e06-bb881df4a9a0-bcf5-4368"

# Bands Libraries
echo "🎸 Adding Bands libraries..."
add_env_var "bunny_cdn_video_streaming_library_bands_16x9" "470162"
add_env_var "bunny_cdn_video_streaming_hostname_bands_16x9" "vz-56742942-596.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_bands_16x9" "ece4199a-2f12-4208-b7f4a9d86801-195f-4a42"
add_env_var "bunny_cdn_video_streaming_library_bands_9x16" "470159"
add_env_var "bunny_cdn_video_streaming_hostname_bands_9x16" "vz-0c1204a1-5bd.b-cdn.net"
add_env_var "bunny_cdn_video_streaming_key_bands_9x16" "d30db014-1f32-4354-b67f5ec28f2f-d051-4ae5"

echo "✅ All Bunny CDN environment variables have been added to Vercel!"
echo "🔄 Remember to redeploy your application to pick up the new environment variables."