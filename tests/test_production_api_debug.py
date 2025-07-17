#!/usr/bin/env python3
"""
Test script to debug production API
"""

import os
import sys
import requests
import json
from pathlib import Path

# Add parent directory to path to import logger
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action, log_error

def test_production_api():
    """Test the production API endpoint"""
    try:
        prod_url = "https://media.synthetikmedia.ai/api/videos/list?limit=10"
        log_action(f"Testing production API: {prod_url}")
        
        response = requests.get(prod_url)
        log_action(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            videos = data.get('videos', [])
            log_action(f"Production API returned {len(videos)} videos")
            
            if videos:
                log_action("\nFirst 5 videos from production:")
                for idx, video in enumerate(videos[:5]):
                    log_action(f"  Video {idx + 1}:")
                    log_action(f"    - ID: {video.get('id')}")
                    log_action(f"    - Description: {video.get('description')}")
                    log_action(f"    - Source: {video.get('src')}")
                    log_action(f"    - Username: {video.get('username')}")
            else:
                log_error("No videos returned from production API!")
                
            # Check pagination info
            pagination = data.get('pagination', {})
            if pagination:
                log_action(f"\nPagination info:")
                log_action(f"  - Total videos: {pagination.get('total', 'N/A')}")
                log_action(f"  - Page: {pagination.get('page', 'N/A')}/{pagination.get('totalPages', 'N/A')}")
                
        else:
            log_error(f"Production API failed with status {response.status_code}")
            log_error(f"Response: {response.text}")
            
    except Exception as e:
        log_error(f"Error testing production API: {str(e)}")

def check_page_source():
    """Check what videos are being shown on the main page"""
    try:
        page_url = "https://media.synthetikmedia.ai"
        log_action(f"\nChecking page source at: {page_url}")
        
        response = requests.get(page_url)
        if response.status_code == 200:
            # Look for video IDs in the page source
            content = response.text
            
            # Check for hardcoded video IDs
            hardcoded_ids = [
                'b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f',
                '755f7bdc-2026-4037-b15d-469397e29010',
                '533f6ad4-cf07-4846-b232-c7f79dce11a5',
                'ab57b1fe-df73-4bcc-8f57-b7869519b62d',
                '67254311-41da-4200-a59c-429995a0755f'
            ]
            
            found_hardcoded = []
            for vid_id in hardcoded_ids:
                if vid_id in content:
                    found_hardcoded.append(vid_id)
                    
            if found_hardcoded:
                log_action(f"Found {len(found_hardcoded)} hardcoded video IDs in page source")
                for vid_id in found_hardcoded[:3]:
                    log_action(f"  - {vid_id}")
            else:
                log_action("No hardcoded video IDs found in page source")
                
            # Check for API fetch code
            if 'fetchVideos' in content:
                log_action("✅ Page contains fetchVideos function")
            else:
                log_action("❌ Page does NOT contain fetchVideos function")
                
            if '/api/videos/list' in content:
                log_action("✅ Page references /api/videos/list endpoint")
            else:
                log_action("❌ Page does NOT reference /api/videos/list endpoint")
                
        else:
            log_error(f"Failed to fetch page source: {response.status_code}")
            
    except Exception as e:
        log_error(f"Error checking page source: {str(e)}")

if __name__ == "__main__":
    log_action("=== Starting Production API Debug Test ===")
    test_production_api()
    check_page_source()
    log_action("=== Test Complete ===")