#!/usr/bin/env python3
"""Test Bunny CDN video URLs"""

import requests
from datetime import datetime

# Video URLs from page.tsx
videos = [
    {
        "id": "b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f",
        "name": "Video 1 (working)",
        "url": "https://vz-97606b97-31d.b-cdn.net/b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f/playlist.m3u8"
    },
    {
        "id": "755f7bdc-2026-4037-b15d-469397e29010", 
        "name": "Video 2 (buffering)",
        "url": "https://vz-97606b97-31d.b-cdn.net/755f7bdc-2026-4037-b15d-469397e29010/playlist.m3u8"
    },
    {
        "id": "533f6ad4-cf07-4846-b232-c7f79dce11a5",
        "name": "Video 3",
        "url": "https://vz-97606b97-31d.b-cdn.net/533f6ad4-cf07-4846-b232-c7f79dce11a5/playlist.m3u8"
    }
]

print(f"Testing Bunny CDN URLs - {datetime.now()}")
print("=" * 60)

for video in videos:
    print(f"\nTesting {video['name']} - ID: {video['id']}")
    print(f"URL: {video['url']}")
    
    try:
        response = requests.head(video['url'], timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Not specified')}")
        print(f"Content-Length: {response.headers.get('Content-Length', 'Not specified')}")
        
        # Try GET request to see if m3u8 is valid
        if response.status_code == 200:
            get_resp = requests.get(video['url'], timeout=5)
            lines = get_resp.text.strip().split('\n')
            print(f"M3U8 Lines: {len(lines)}")
            if lines[0] == "#EXTM3U":
                print("✓ Valid M3U8 playlist")
            else:
                print("✗ Invalid M3U8 format")
                
    except Exception as e:
        print(f"Error: {str(e)}")