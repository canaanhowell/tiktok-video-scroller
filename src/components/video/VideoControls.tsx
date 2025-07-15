'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useDevice } from '@/contexts/DeviceContext'
import { Typography } from '@/components/ui/Typography'

interface VideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  buffered: number
  onPlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  onFullscreenToggle: () => void
  className?: string
  show?: boolean
}

export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  buffered,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  className,
  show = true,
}: VideoControlsProps) {
  const { isMobile, isTouch } = useDevice()
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle progress bar interaction
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onSeek(Math.max(0, Math.min(duration, newTime)))
  }, [duration, onSeek])

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingProgress(true)
    handleProgressClick(e)
  }, [handleProgressClick])

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingProgress) return
    
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onSeek(Math.max(0, Math.min(duration, newTime)))
  }, [isDraggingProgress, duration, onSeek])

  const handleProgressMouseUp = useCallback(() => {
    setIsDraggingProgress(false)
  }, [])

  // Handle volume interaction
  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = volumeRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const percentage = x / rect.width
    onVolumeChange(Math.max(0, Math.min(1, percentage)))
  }, [onVolumeChange])

  const handleVolumeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true)
    handleVolumeClick(e)
  }, [handleVolumeClick])

  const handleVolumeMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingVolume) return
    
    const rect = volumeRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const percentage = x / rect.width
    onVolumeChange(Math.max(0, Math.min(1, percentage)))
  }, [isDraggingVolume, onVolumeChange])

  const handleVolumeMouseUp = useCallback(() => {
    setIsDraggingVolume(false)
  }, [])

  // Add global mouse event listeners
  useEffect(() => {
    if (isDraggingProgress) {
      document.addEventListener('mousemove', handleProgressMouseMove)
      document.addEventListener('mouseup', handleProgressMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove)
        document.removeEventListener('mouseup', handleProgressMouseUp)
      }
    }
  }, [isDraggingProgress, handleProgressMouseMove, handleProgressMouseUp])

  useEffect(() => {
    if (isDraggingVolume) {
      document.addEventListener('mousemove', handleVolumeMouseMove)
      document.addEventListener('mouseup', handleVolumeMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleVolumeMouseMove)
        document.removeEventListener('mouseup', handleVolumeMouseUp)
      }
    }
  }, [isDraggingVolume, handleVolumeMouseMove, handleVolumeMouseUp])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent',
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
    >
      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div
          ref={progressRef}
          className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
          onMouseDown={handleProgressMouseDown}
          onClick={handleProgressClick}
        >
          {/* Buffered progress */}
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          
          {/* Playback progress */}
          <div
            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all group-hover:h-1.5"
            style={{ width: `${progress}%` }}
          >
            {/* Scrubber handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between px-4 pb-4">
        {/* Left controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={onPlayPause}
            className="touch-target flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Volume controls (desktop only) */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              <button
                onClick={onMuteToggle}
                className="touch-target flex items-center justify-center"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                )}
              </button>

              {/* Volume slider */}
              <div
                ref={volumeRef}
                className="relative w-20 h-1 bg-white/20 rounded-full cursor-pointer group"
                onMouseDown={handleVolumeMouseDown}
                onClick={handleVolumeClick}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-all group-hover:h-1.5"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          )}

          {/* Time display */}
          <Typography variant="caption" className="text-white/80 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Mobile volume button */}
          {isMobile && (
            <button
              onClick={onMuteToggle}
              className="touch-target flex items-center justify-center"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
          )}

          {/* Fullscreen button */}
          <button
            onClick={onFullscreenToggle}
            className="touch-target flex items-center justify-center"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}