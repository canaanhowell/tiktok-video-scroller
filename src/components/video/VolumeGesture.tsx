'use client'

import { useEffect, useState } from 'react'
import { useDrag } from '@use-gesture/react'
import { useDevice } from '@/contexts/DeviceContext'
import { cn } from '@/lib/utils'

interface VolumeGestureProps {
  onVolumeChange: (volume: number) => void
  currentVolume: number
  className?: string
  children: React.ReactNode
}

export function VolumeGesture({
  onVolumeChange,
  currentVolume,
  className,
  children,
}: VolumeGestureProps) {
  const { isMobile, isTouch } = useDevice()
  const [showIndicator, setShowIndicator] = useState(false)
  const [gestureVolume, setGestureVolume] = useState(currentVolume)

  // Only enable on touch devices
  const bind = useDrag(
    ({ movement: [, my], first, last, memo = currentVolume }) => {
      if (!isTouch) return memo

      // Calculate volume based on vertical movement
      // Moving up increases volume, moving down decreases
      const sensitivity = 200 // pixels for full volume change
      const volumeDelta = -my / sensitivity
      const newVolume = Math.max(0, Math.min(1, memo + volumeDelta))

      if (first) {
        setShowIndicator(true)
      }

      setGestureVolume(newVolume)
      onVolumeChange(newVolume)

      if (last) {
        setTimeout(() => setShowIndicator(false), 1000)
      }

      return memo
    },
    {
      filterTaps: true,
      axis: 'y',
      enabled: isTouch,
    }
  )

  return (
    <div className={cn('relative', className)} {...bind()}>
      {children}

      {/* Volume indicator */}
      {showIndicator && isTouch && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              {gestureVolume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : gestureVolume < 0.5 ? (
                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              )}
            </svg>
            
            {/* Volume bar */}
            <div className="w-1 h-20 bg-white/30 rounded-full relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-full transition-all"
                style={{ height: `${gestureVolume * 100}%` }}
              />
            </div>
            
            <span className="text-white text-sm font-medium">
              {Math.round(gestureVolume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Alternative horizontal volume gesture for landscape mode
export function HorizontalVolumeGesture({
  onVolumeChange,
  currentVolume,
  className,
  children,
}: VolumeGestureProps) {
  const { isTouch, isPortrait } = useDevice()
  const [showIndicator, setShowIndicator] = useState(false)
  const [gestureVolume, setGestureVolume] = useState(currentVolume)

  // Only enable in landscape on touch devices
  const bind = useDrag(
    ({ movement: [mx], first, last, memo = currentVolume }) => {
      if (!isTouch || isPortrait) return memo

      // Calculate volume based on horizontal movement
      const sensitivity = 300 // pixels for full volume change
      const volumeDelta = mx / sensitivity
      const newVolume = Math.max(0, Math.min(1, memo + volumeDelta))

      if (first) {
        setShowIndicator(true)
      }

      setGestureVolume(newVolume)
      onVolumeChange(newVolume)

      if (last) {
        setTimeout(() => setShowIndicator(false), 1000)
      }

      return memo
    },
    {
      filterTaps: true,
      axis: 'x',
      enabled: isTouch && !isPortrait,
    }
  )

  return (
    <div className={cn('relative', className)} {...bind()}>
      {children}

      {/* Horizontal volume indicator */}
      {showIndicator && isTouch && !isPortrait && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-3">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              {gestureVolume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              )}
            </svg>
            
            {/* Horizontal volume bar */}
            <div className="w-32 h-1 bg-white/30 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 left-0 bottom-0 bg-white rounded-full transition-all"
                style={{ width: `${gestureVolume * 100}%` }}
              />
            </div>
            
            <span className="text-white text-sm font-medium min-w-[3ch] text-right">
              {Math.round(gestureVolume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}