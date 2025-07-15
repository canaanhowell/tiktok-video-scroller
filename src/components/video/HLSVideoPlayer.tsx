'use client'

import { useRef, useEffect, useState, forwardRef } from 'react'
import Hls, { Level } from 'hls.js'
import { VideoPlayer } from './VideoPlayer'

interface HLSVideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  onQualityChange?: (quality: number) => void
  onQualityLevelsAvailable?: (levels: Level[]) => void
}

export const HLSVideoPlayer = forwardRef<HTMLVideoElement, HLSVideoPlayerProps>(
  ({ src, poster, className, autoPlay = false, muted = true, loop = true, onQualityChange, onQualityLevelsAvailable }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const [videoSrc, setVideoSrc] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [qualityLevels, setQualityLevels] = useState<Level[]>([])
    const [currentLevel, setCurrentLevel] = useState<number>(-1)

    useEffect(() => {
      const video = (typeof ref === 'object' && ref?.current) || videoRef.current
      if (!video || !src) return

    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Create HLS instance with high quality preferences
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferLength: 30, // 30 seconds
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
        // Force highest quality
        startLevel: -1, // Auto mode, but we'll override after manifest loads
        maxMaxBufferLength: 600, // Allow more buffering for quality
        // Prefer quality over speed
        abrEwmaDefaultEstimate: 5000000, // 5 Mbps default bandwidth estimate
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      })

      hlsRef.current = hls

      // Load the source
      hls.loadSource(src)
      hls.attachMedia(video)

      // Handle HLS events
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS manifest loaded, quality levels:', data.levels)
        setQualityLevels(data.levels)
        onQualityLevelsAvailable?.(data.levels)
        
        // Force highest quality level
        if (data.levels.length > 0) {
          const highestQualityIndex = data.levels.length - 1
          console.log('Setting quality to highest level:', highestQualityIndex, data.levels[highestQualityIndex])
          hls.startLevel = highestQualityIndex
          hls.currentLevel = highestQualityIndex
          hls.loadLevel = highestQualityIndex
        }
        
        // Start playback if autoplay is enabled
        if (autoPlay) {
          video.play().catch(err => {
            console.error('Autoplay failed:', err)
          })
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log('HLS quality switched to:', data.level)
        setCurrentLevel(data.level)
        onQualityChange?.(data.level)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error, trying to recover')
              setError('Network error occurred')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error, trying to recover')
              setError('Media error occurred')
              hls.recoverMediaError()
              break
            default:
              console.error('Fatal error, cannot recover')
              setError('An error occurred while loading the video')
              hls.destroy()
              break
          }
        }
      })

      // Set video source for VideoPlayer component
      setVideoSrc('')  // Clear to force re-render
      setTimeout(() => setVideoSrc(src), 0)

      // Cleanup
      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('Using native HLS support')
      setVideoSrc(src)
    } else {
      setError('HLS is not supported in this browser')
      console.error('HLS is not supported')
    }
  }, [src, autoPlay, onQualityChange, onQualityLevelsAvailable, ref])

  // Method to change quality
  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      console.log('Changing quality to level:', levelIndex)
      hlsRef.current.currentLevel = levelIndex
    }
  }

  // Method to get current quality info
  const getCurrentQuality = () => {
    if (hlsRef.current && hlsRef.current.currentLevel >= 0) {
      return qualityLevels[hlsRef.current.currentLevel]
    }
    return null
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black text-white ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm mb-2">Unable to play video</p>
          <p className="text-xs text-white/60">{error}</p>
        </div>
      </div>
    )
  }

    return (
      <VideoPlayer
        ref={ref || videoRef}
        src={videoSrc}
        poster={poster}
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
      />
    )
  }
)

HLSVideoPlayer.displayName = 'HLSVideoPlayer'

// Export quality selector component for use in controls
export interface QualityLevel {
  height: number
  bitrate: number
  name: string
}

export function getQualityName(level: Level): string {
  const height = level.height
  if (height >= 2160) return '4K'
  if (height >= 1440) return '1440p'
  if (height >= 1080) return '1080p'
  if (height >= 720) return '720p'
  if (height >= 480) return '480p'
  if (height >= 360) return '360p'
  return `${height}p`
}