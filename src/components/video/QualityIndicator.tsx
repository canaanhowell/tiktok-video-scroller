'use client'

import { useEffect, useState } from 'react'

interface QualityIndicatorProps {
  currentLevel: number
  levels: Array<{
    height: number
    bitrate: number
  }>
}

export function QualityIndicator({ currentLevel, levels }: QualityIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(true)

  useEffect(() => {
    // Hide indicator after 5 seconds
    const timer = setTimeout(() => setShowIndicator(false), 5000)
    return () => clearTimeout(timer)
  }, [currentLevel]) // Reset timer when quality changes

  if (!showIndicator || currentLevel < 0 || !levels[currentLevel]) return null

  const quality = levels[currentLevel]
  const qualityLabel = quality.height >= 1080 ? 'HD' : quality.height >= 720 ? '720p' : `${quality.height}p`
  const bitrateMbps = (quality.bitrate / 1000000).toFixed(1)

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${quality.height >= 1080 ? 'bg-green-500' : quality.height >= 720 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">{qualityLabel}</span>
          <span className="text-xs opacity-70">{bitrateMbps} Mbps</span>
        </div>
      </div>
    </div>
  )
}