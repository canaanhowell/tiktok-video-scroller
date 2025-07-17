#!/usr/bin/env python3
"""
Test what videos are actually being displayed on the page
"""

import os
import sys
import requests
import json
from pathlib import Path

# Add parent directory to path to import logger
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action, log_error

def check_displayed_videos():
    """Check what videos are displayed by looking at the page's JavaScript"""
    try:
        # First, let's check if the development server shows the correct behavior
        log_action("Checking local development server behavior...")
        
        # Check the actual page source more carefully
        page_url = "https://media.synthetikmedia.ai"
        log_action(f"\nAnalyzing production page at: {page_url}")
        
        response = requests.get(page_url)
        if response.status_code == 200:
            content = response.text
            
            # Look for specific patterns in the compiled JavaScript
            if 'Romance Wedding Video' in content:
                log_action("✅ Found 'Romance Wedding Video' in page content - hardcoded videos are present")
            else:
                log_action("❌ No 'Romance Wedding Video' found - hardcoded videos might not be present")
                
            if 'synthetikmedia' in content:
                log_action("✅ Found 'synthetikmedia' username in page content")
            else:
                log_action("❌ No 'synthetikmedia' username found")
                
            # Check for stock video references
            stock_phrases = ['stock', 'demo', 'placeholder', 'sample']
            found_stock = False
            for phrase in stock_phrases:
                if phrase.lower() in content.lower():
                    found_stock = True
                    log_action(f"⚠️  Found '{phrase}' in page content - might be showing stock videos")
                    
            if not found_stock:
                log_action("✅ No obvious stock/demo video references found")
                
            # Check console output by looking for specific log patterns
            if 'console.log' in content and 'Fetched videos from Bunny CDN' in content:
                log_action("✅ Page contains console.log for Bunny CDN fetching")
            else:
                log_action("❌ Page doesn't seem to log Bunny CDN fetching")
                
            # Save a snippet of the page for analysis
            snippet_file = Path(__file__).parent / 'page_snippet.html'
            with open(snippet_file, 'w') as f:
                # Save first 10000 characters
                f.write(content[:10000])
            log_action(f"\nSaved page snippet to: {snippet_file}")
            
            # Try to find the specific video configuration
            video_ids = [
                'b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f',
                '755f7bdc-2026-4037-b15d-469397e29010',
                '533f6ad4-cf07-4846-b232-c7f79dce11a5',
                'ab57b1fe-df73-4bcc-8f57-b7869519b62d',
                '67254311-41da-4200-a59c-429995a0755f'
            ]
            
            found_count = 0
            for vid_id in video_ids:
                if vid_id in content:
                    found_count += 1
                    
            log_action(f"\nFound {found_count}/5 expected romance video IDs in page content")
            
            if found_count == 5:
                log_action("✅ All romance video IDs are present in the page")
                log_action("\nCONCLUSION: The page DOES contain the correct video IDs.")
                log_action("The issue might be:")
                log_action("1. Videos are failing to load from Bunny CDN")
                log_action("2. The video player is showing fallback/stock videos on error")
                log_action("3. There's a client-side issue preventing proper video display")
            else:
                log_action("❌ Not all romance video IDs found")
                log_action("The page might be using an older build")
                
        else:
            log_error(f"Failed to fetch page: {response.status_code}")
            
    except Exception as e:
        log_error(f"Error checking displayed videos: {str(e)}")

if __name__ == "__main__":
    log_action("=== Checking What Videos Are Actually Displayed ===")
    check_displayed_videos()
    log_action("=== Check Complete ===")