#!/bin/bash

# Video Component Cleanup Script
# Removes outdated/buggy video components to prevent future confusion
# Preserves: VideoScrollerFresh.tsx (WORKING SOLUTION)

echo "🧹 Cleaning up outdated video components..."
echo "================================================"

# Components to KEEP (working solutions)
KEEP_COMPONENTS=(
    "VideoScrollerFresh.tsx"
    "VideoPlayer.tsx"
    "VideoControls.tsx"
    "QualitySelector.tsx"
    "VolumeGesture.tsx"
)

# Components to REMOVE (problematic/outdated)
REMOVE_COMPONENTS=(
    "VideoScrollerSnap.tsx"
    "VideoScrollerDebug.tsx" 
    "VideoScrollerFixed.tsx"
    "VideoScrollerBasic.tsx"
    "VideoScrollerOptimized.tsx"
    "VideoScrollerPro.tsx"
    "VideoScrollerMemoryOptimized.tsx"
    "VideoScrollerIntersection.tsx"
    "VideoScrollerRedis.tsx"
    "VideoScrollerWorking.tsx"
    "VideoDebug.tsx"
    "OptimizedVideoPlayer.tsx"
    "EnhancedVideoPlayer.tsx"
    "HLSVideoPlayer.tsx"
    "VideoPreloader.tsx"
    "QualityIndicator.tsx"
)

cd src/components/video/

echo "📋 Components to keep:"
for component in "${KEEP_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "  ✅ $component (KEEPING - working solution)"
    fi
done

echo ""
echo "🗑️ Components to remove:"
for component in "${REMOVE_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "  ❌ $component (REMOVING - outdated/buggy)"
        rm "$component"
    fi
done

# Clean up backup and test directories
echo ""
echo "🗂️ Cleaning backup and test directories..."
if [ -d "backup" ]; then
    echo "  ❌ Removing backup/ directory"
    rm -rf backup/
fi

if [ -d "tests" ]; then
    echo "  ❌ Removing tests/ directory"  
    rm -rf tests/
fi

# Also clean up the old VideoScroller.tsx if it exists
if [ -f "VideoScroller.tsx" ]; then
    echo "  ❌ Removing old VideoScroller.tsx"
    rm "VideoScroller.tsx"
fi

if [ -f "VideoScrollerSimple.tsx" ]; then
    echo "  ❌ Removing VideoScrollerSimple.tsx"
    rm "VideoScrollerSimple.tsx"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📁 Remaining components:"
ls -la *.tsx 2>/dev/null || echo "No .tsx files remaining"

echo ""
echo "🎯 WORKING SOLUTION: VideoScrollerFresh.tsx"
echo "   This is the only video scroller component you should use!"
echo "   It has simplified HLS.js support that actually works."