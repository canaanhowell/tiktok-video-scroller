'use client'

import { useRef, useState, useEffect, useCallback, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useDevice } from '@/contexts/DeviceContext'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: Error) => void
  onLoadStart?: () => void
  onLoadedData?: () => void
  onProgress?: (buffered: number) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, poster, className, autoPlay = false, muted = true, loop = true, playsInline = true, preload = 'metadata', onPlay, onPause, onEnded, onError, onLoadStart, onLoadedData, onProgress, onTimeUpdate }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null)
    const videoRef = ref || internalRef
    const containerRef = useRef<HTMLDivElement>(null)
    const { isMobile, isTouch } = useDevice()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(!isTouch)

    // Handle play/pause
    const togglePlayPause = useCallback(() => {
      const video = (videoRef as React.RefObject<HTMLVideoElement>).current
      if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(err => {
        console.error('Failed to play video:', err)
        setError('Failed to play video')
      })
    }
  }, [isPlaying])

    // Handle volume
    const handleVolumeChange = useCallback((newVolume: number) => {
      const video = (videoRef as React.RefObject<HTMLVideoElement>).current
      if (!video) return

    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    video.volume = clampedVolume
    setVolume(clampedVolume)
    setIsMuted(clampedVolume === 0)
  }, [])

    // Toggle mute
    const toggleMute = useCallback(() => {
      const video = (videoRef as React.RefObject<HTMLVideoElement>).current
      if (!video) return

    if (isMuted) {
      video.muted = false
      video.volume = volume > 0 ? volume : 1
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }, [isMuted, volume])

    // Handle seek
    const handleSeek = useCallback((time: number) => {
      const video = (videoRef as React.RefObject<HTMLVideoElement>).current
      if (!video) return

    video.currentTime = time
    setCurrentTime(time)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

    // Video event handlers
    useEffect(() => {
      const video = (videoRef as React.RefObject<HTMLVideoElement>).current
      if (!video) return

    const handlePlay = () => {
      setIsPlaying(true)
      setError(null)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleError = () => {
      const error = video.error
      const message = error?.message || 'An error occurred'
      setError(message)
      setIsLoading(false)
      onError?.(new Error(message))
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
      onLoadStart?.()
    }

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(video.duration)
      onLoadedData?.()
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime, video.duration)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedAmount = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedAmount)
        onProgress?.(bufferedAmount)
      }
    }

    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleDurationChange = () => setDuration(video.duration)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    // Add event listeners
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('volumechange', handleVolumeChange)

    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [onPlay, onPause, onEnded, onError, onLoadStart, onLoadedData, onTimeUpdate, onProgress])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Show/hide controls
  useEffect(() => {
    if (!isTouch) return

    let timeout: NodeJS.Timeout

    const showControlsTemporarily = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', showControlsTemporarily)
    container.addEventListener('mousemove', showControlsTemporarily)

    return () => {
      container.removeEventListener('touchstart', showControlsTemporarily)
      container.removeEventListener('mousemove', showControlsTemporarily)
      clearTimeout(timeout)
    }
  }, [isTouch])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        className="w-full h-full object-contain"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Buffering indicator */}
      {isBuffering && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75">
          <div className="text-center text-white p-4">
            <p className="text-sm mb-2">Unable to play video</p>
            <p className="text-xs text-white/60">{error}</p>
          </div>
        </div>
      )}

      {/* Basic controls overlay - will be enhanced in next steps */}
      {showControls && !error && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {!isPlaying && (
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'