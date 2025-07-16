#!/usr/bin/env python3
"""Test API video response"""

import requests
import json
from datetime import datetime

print(f"Testing Production API - {datetime.now()}")
print("=" * 60)

# Test production API
api_url = "https://media.synthetikmedia.ai/api/videos/list?limit=20"
print(f"API URL: {api_url}\n")

try:
    response = requests.get(api_url, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total Videos: {len(data.get('videos', []))}")
        
        # Show first 3 videos
        for i, video in enumerate(data.get('videos', [])[:3]):
            print(f"\nVideo {i+1}:")
            print(f"  ID: {video.get('id')}")
            print(f"  Title: {video.get('title')}")
            print(f"  Status: {video.get('status')}")
            print(f"  URL: {video.get('src')}")
            
            # Test if this URL is accessible
            if video.get('src'):
                try:
                    url_resp = requests.head(video.get('src'), timeout=5)
                    print(f"  URL Status: {url_resp.status_code}")
                except Exception as e:
                    print(f"  URL Error: {str(e)}")
                    
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"API Error: {str(e)}")