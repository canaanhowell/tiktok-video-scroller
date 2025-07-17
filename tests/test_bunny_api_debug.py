#!/usr/bin/env python3
"""
Test script to debug Bunny CDN API and check what videos are being returned
"""

import os
import sys
import requests
import json
from pathlib import Path

# Add parent directory to path to import logger
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action, log_error

def load_env_vars():
    """Load environment variables from .env"""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        log_action("Loading environment variables from .env")
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    # Handle spaces around equals sign
                    parts = line.strip().split('=', 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip()
                        os.environ[key] = value
    else:
        log_error(f".env not found at {env_path}")

def test_bunny_api():
    """Test the Bunny CDN API directly"""
    load_env_vars()
    
    STREAMING_LIBRARY = os.getenv('bunny_cdn_streaming_library')
    STREAMING_KEY = os.getenv('bunny_cdn_streaming_key')
    STREAMING_HOSTNAME = os.getenv('bunny_cdn_streaming_hostname')
    
    log_action(f"Testing Bunny CDN API with library: {STREAMING_LIBRARY}")
    log_action(f"Streaming hostname: {STREAMING_HOSTNAME}")
    
    if not all([STREAMING_LIBRARY, STREAMING_KEY, STREAMING_HOSTNAME]):
        log_error("Missing required environment variables")
        return
    
    try:
        # Test the Bunny Stream API
        url = f"https://video.bunnycdn.com/library/{STREAMING_LIBRARY}/videos"
        headers = {
            'Accept': 'application/json',
            'AccessKey': STREAMING_KEY
        }
        params = {
            'page': 1,
            'itemsPerPage': 20,
            'orderBy': 'date'
        }
        
        log_action(f"Fetching videos from: {url}")
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            log_action(f"API Response successful - Total videos: {data.get('totalItems', 0)}")
            
            videos = data.get('items', [])
            log_action(f"Found {len(videos)} videos in response")
            
            # Display video details
            for idx, video in enumerate(videos):
                log_action(f"\nVideo {idx + 1}:")
                log_action(f"  - Title: {video.get('title', 'N/A')}")
                log_action(f"  - GUID: {video.get('guid', 'N/A')}")
                log_action(f"  - Status: {video.get('status', 'N/A')} (4=Ready, 3=Encoding)")
                log_action(f"  - Date Uploaded: {video.get('dateUploaded', 'N/A')}")
                log_action(f"  - URL: https://{STREAMING_HOSTNAME}/{video.get('guid')}/playlist.m3u8")
                
            # Check if any videos match the ones in uploaded-videos.json
            uploaded_path = Path(__file__).parent.parent / 'uploaded-videos.json'
            if uploaded_path.exists():
                with open(uploaded_path, 'r') as f:
                    uploaded = json.load(f)
                
                log_action("\nChecking against uploaded-videos.json:")
                uploaded_ids = [v['videoId'] for v in uploaded]
                api_ids = [v.get('guid') for v in videos]
                
                matching = set(uploaded_ids) & set(api_ids)
                if matching:
                    log_action(f"✅ Found {len(matching)} matching videos")
                else:
                    log_action("❌ No matching videos found between API and uploaded-videos.json")
                    log_action(f"Uploaded IDs: {uploaded_ids}")
                    log_action(f"API IDs: {api_ids}")
                    
        else:
            log_error(f"API request failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            
    except Exception as e:
        log_error(f"Error testing Bunny API: {str(e)}")

def test_local_api():
    """Test the local API endpoint"""
    try:
        # Test against local development server
        local_url = "http://localhost:3000/api/videos/list?limit=20"
        log_action(f"\nTesting local API: {local_url}")
        
        response = requests.get(local_url)
        if response.status_code == 200:
            data = response.json()
            videos = data.get('videos', [])
            log_action(f"Local API returned {len(videos)} videos")
            
            for idx, video in enumerate(videos[:3]):  # Show first 3
                log_action(f"  Video {idx + 1}: {video.get('id')} - {video.get('description')}")
        else:
            log_error(f"Local API failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        log_action("Local server not running - skipping local API test")
    except Exception as e:
        log_error(f"Error testing local API: {str(e)}")

if __name__ == "__main__":
    log_action("=== Starting Bunny CDN API Debug Test ===")
    test_bunny_api()
    test_local_api()
    log_action("=== Test Complete ===")