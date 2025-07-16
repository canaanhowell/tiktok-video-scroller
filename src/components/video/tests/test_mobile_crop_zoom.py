#!/usr/bin/env python3
"""
Test script to calculate auto crop/zoom for converting videos to 9:16 on mobile
"""

def calculate_crop_zoom(video_aspect_ratio, target_ratio=9/16):
    """
    Calculate crop and zoom needed to convert any aspect ratio to 9:16
    """
    print(f"Video aspect ratio: {video_aspect_ratio:.3f}")
    print(f"Target ratio: {target_ratio:.3f} (9:16)")
    
    if video_aspect_ratio < target_ratio:
        # Video is taller than target - need to crop top/bottom
        zoom_factor = 1.0
        crop_percentage = ((1 - (target_ratio / video_aspect_ratio)) * 100) / 2
        print(f"\nStrategy: Crop top and bottom")
        print(f"Zoom: {zoom_factor}x (no zoom needed)")
        print(f"Crop: {crop_percentage:.1f}% from top and bottom")
    else:
        # Video is wider than target - need to zoom in and crop sides
        zoom_factor = video_aspect_ratio / target_ratio
        crop_percentage = ((1 - (1 / zoom_factor)) * 100) / 2
        print(f"\nStrategy: Zoom in and crop sides")
        print(f"Zoom: {zoom_factor:.2f}x")
        print(f"Crop: {crop_percentage:.1f}% from left and right after zoom")
    
    return zoom_factor, crop_percentage

# Test common video aspect ratios
test_cases = [
    {
        "name": "9:16 (TikTok/Instagram Reels)",
        "ratio": 9/16,
        "dimensions": "1080x1920"
    },
    {
        "name": "16:9 (YouTube/Landscape)",
        "ratio": 16/9,
        "dimensions": "1920x1080"
    },
    {
        "name": "1:1 (Square/Instagram)",
        "ratio": 1/1,
        "dimensions": "1080x1080"
    },
    {
        "name": "4:3 (Traditional TV)",
        "ratio": 4/3,
        "dimensions": "1440x1080"
    },
    {
        "name": "21:9 (Ultrawide)",
        "ratio": 21/9,
        "dimensions": "2560x1080"
    },
    {
        "name": "3:4 (Portrait)",
        "ratio": 3/4,
        "dimensions": "1080x1440"
    }
]

print("Mobile Auto Crop/Zoom to 9:16 Calculations")
print("=" * 60)

for case in test_cases:
    print(f"\n📹 {case['name']} ({case['dimensions']})")
    print("-" * 40)
    zoom, crop = calculate_crop_zoom(case['ratio'])
    
print("\n\nCSS Implementation Strategy:")
print("=" * 60)
print("""
For mobile devices, apply these CSS transformations:

1. For wider videos (16:9, 1:1, etc):
   - transform: scale(zoom_factor)
   - object-fit: cover
   - object-position: center

2. For taller videos (3:4):
   - object-fit: cover
   - height: 100%
   - width: auto

The key is using CSS object-fit: cover with proper scaling
to automatically crop and center the video content.
""")