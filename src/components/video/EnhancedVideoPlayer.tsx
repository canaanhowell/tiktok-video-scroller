'use client'

import { useRef, useState, forwardRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDevice } from '@/contexts/DeviceContext'
import { HLSVideoPlayer } from './HLSVideoPlayer'
import { VideoControls } from './VideoControls'
import { VolumeGesture, HorizontalVolumeGesture } from './VolumeGesture'
import { QualitySelector, MobileQualitySelector } from './QualitySelector'
import type { Level } from 'hls.js'

interface EnhancedVideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  showControls?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: Error) => void
}

export const EnhancedVideoPlayer = forwardRef<HTMLVideoElement, EnhancedVideoPlayerProps>(
  ({ src, poster, className, autoPlay = false, muted = true, loop = true, showControls = true, onPlay, onPause, onEnded, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { isMobile, isPortrait } = useDevice()
    
    // Video state
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(muted)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [buffered, setBuffered] = useState(0)
    const [showControlsState, setShowControlsState] = useState(true)
    
    // HLS state
    const [qualityLevels, setQualityLevels] = useState<Level[]>([])
    const [currentQuality, setCurrentQuality] = useState(-1)
    const [showQualitySelector, setShowQualitySelector] = useState(false)

    // Handle play/pause
    const handlePlayPause = () => {
      const video = (typeof ref === 'object' && ref?.current) || containerRef.current?.querySelector('video')
      if (!video) return

      if (isPlaying) {
        video.pause()
      } else {
        video.play().catch(err => {
          console.error('Failed to play video:', err)
        })
      }
    }

    // Handle volume change
    const handleVolumeChange = (newVolume: number) => {
      const video = (typeof ref === 'object' && ref?.current) || containerRef.current?.querySelector('video')
      if (!video) return

      video.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }

    // Handle mute toggle
    const handleMuteToggle = () => {
      const video = (typeof ref === 'object' && ref?.current) || containerRef.current?.querySelector('video')
      if (!video) return

      if (isMuted) {
        video.muted = false
        video.volume = volume > 0 ? volume : 1
        setIsMuted(false)
      } else {
        video.muted = true
        setIsMuted(true)
      }
    }

    // Handle seek
    const handleSeek = (time: number) => {
      const video = (typeof ref === 'object' && ref?.current) || containerRef.current?.querySelector('video')
      if (!video) return

      video.currentTime = time
      setCurrentTime(time)
    }

    // Handle fullscreen
    const handleFullscreenToggle = async () => {
      try {
        if (!document.fullscreenElement) {
          await containerRef.current?.requestFullscreen()
          setIsFullscreen(true)
        } else {
          await document.exitFullscreen()
          setIsFullscreen(false)
        }
      } catch (err) {
        console.error('Fullscreen error:', err)
      }
    }

    // Handle quality change
    const handleQualityChange = (level: number) => {
      setCurrentQuality(level)
      // The actual quality change is handled by HLSVideoPlayer
    }

    // Gesture wrapper component
    const GestureWrapper = isPortrait ? VolumeGesture : HorizontalVolumeGesture

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black overflow-hidden',
          isFullscreen && 'fixed inset-0 z-50',
          className
        )}
      >
        <GestureWrapper
          onVolumeChange={handleVolumeChange}
          currentVolume={volume}
          className="w-full h-full"
        >
          <HLSVideoPlayer
            ref={ref}
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            onQualityLevelsAvailable={setQualityLevels}
            onQualityChange={setCurrentQuality}
            className="w-full h-full"
          />
        </GestureWrapper>

        {/* Controls */}
        {showControls && (
          <>
            <VideoControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              isFullscreen={isFullscreen}
              buffered={buffered}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onFullscreenToggle={handleFullscreenToggle}
              show={showControlsState}
              className="z-10"
            />

            {/* Quality selector */}
            {qualityLevels.length > 0 && (
              <>
                {isMobile ? (
                  <>
                    <button
                      onClick={() => setShowQualitySelector(true)}
                      className="absolute top-4 right-4 z-20 touch-target flex items-center justify-center px-2 py-1 rounded bg-black/50 backdrop-blur"
                      aria-label="Video quality"
                    >
                      <svg className="w-4 h-4 mr-1 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 14.52l-2.83-2.83c-.61-.61-1.09-.99-1.69-.99-.6 0-1.08.38-1.69.99l-2.83 2.83c-.39.39-.39 1.02 0 1.41l2.83 2.83c.61.61 1.09.99 1.69.99.6 0 1.08-.38 1.69-.99l2.83-2.83c.39-.39.39-1.02 0-1.41zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                      </svg>
                      <span className="text-white text-xs">
                        {currentQuality === -1 ? 'Auto' : qualityLevels[currentQuality]?.height + 'p'}
                      </span>
                    </button>
                    <MobileQualitySelector
                      levels={qualityLevels}
                      currentLevel={currentQuality}
                      onLevelChange={handleQualityChange}
                      isOpen={showQualitySelector}
                      onClose={() => setShowQualitySelector(false)}
                    />
                  </>
                ) : (
                  <div className="absolute top-4 right-4 z-20">
                    <QualitySelector
                      levels={qualityLevels}
                      currentLevel={currentQuality}
                      onLevelChange={handleQualityChange}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Video event handler component */}
        <VideoEventHandler
          videoRef={ref}
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          onPlayingChange={setIsPlaying}
          onTimeUpdate={(time, dur) => {
            setCurrentTime(time)
            setDuration(dur)
          }}
          onProgress={setBuffered}
          onVolumeChange={(vol, muted) => {
            setVolume(vol)
            setIsMuted(muted)
          }}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
        />
      </div>
    )
  }
)

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer'

// Video event handler component
interface VideoEventHandlerProps {
  videoRef: React.ForwardedRef<HTMLVideoElement>
  containerRef: React.RefObject<HTMLDivElement>
  onPlayingChange: (playing: boolean) => void
  onTimeUpdate: (currentTime: number, duration: number) => void
  onProgress: (buffered: number) => void
  onVolumeChange: (volume: number, muted: boolean) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: Error) => void
}

function VideoEventHandler({
  videoRef,
  containerRef,
  onPlayingChange,
  onTimeUpdate,
  onProgress,
  onVolumeChange,
  onPlay,
  onPause,
  onEnded,
  onError,
}: VideoEventHandlerProps) {
  useEffect(() => {
    const video = (typeof videoRef === 'object' && videoRef?.current) || containerRef.current?.querySelector('video')
    if (!video) return

    const handlePlay = () => {
      onPlayingChange(true)
      onPlay?.()
    }

    const handlePause = () => {
      onPlayingChange(false)
      onPause?.()
    }

    const handleEnded = () => {
      onPlayingChange(false)
      onEnded?.()
    }

    const handleError = () => {
      const error = video.error
      const message = error?.message || 'An error occurred'
      onError?.(new Error(message))
    }

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime, video.duration)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedAmount = (bufferedEnd / video.duration) * 100
        onProgress(bufferedAmount)
      }
    }

    const handleVolumeChange = () => {
      onVolumeChange(video.volume, video.muted)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [videoRef, containerRef, onPlayingChange, onTimeUpdate, onProgress, onVolumeChange, onPlay, onPause, onEnded, onError])

  return null
}