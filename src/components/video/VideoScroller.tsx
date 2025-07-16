'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'
import Hls from 'hls.js'
import { cn } from '@/lib/utils'
import { EnhancedVideoPlayer } from './EnhancedVideoPlayer'
import { useDevice } from '@/contexts/DeviceContext'
import { useInteraction } from '@/contexts/InteractionContext'
import { VideoPreloader, useVideoPreloader } from './VideoPreloader'

interface Video {
  id: string
  src: string
  poster?: string
  username: string
  description: string
  likes: number
  comments: number
  shares: number
}

interface VideoScrollerProps {
  videos: Video[]
  className?: string
  onVideoChange?: (index: number, video: Video) => void
}

export function VideoScroller({ videos, className, onVideoChange }: VideoScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const { isMobile, isTouch } = useDevice()

  // Preload adjacent videos
  useVideoPreloader(videos, currentIndex, {
    preloadRange: isMobile ? 1 : 2, // Preload fewer on mobile
    enabled: true
  })

  // Handle scroll snap end to detect current video
  const handleScroll = useCallback(() => {
    if (!scrollerRef.current) return

    const container = scrollerRef.current
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    
    // Calculate which video is currently in view
    const newIndex = Math.round(scrollTop / containerHeight)
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      console.log('Video changed from', currentIndex, 'to', newIndex)
      setCurrentIndex(newIndex)
      onVideoChange?.(newIndex, videos[newIndex])
    }
  }, [currentIndex, videos, onVideoChange])

  // Immediate scroll handler
  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    // Handle scroll immediately for better responsiveness
    const handleScrollEvent = () => {
      handleScroll()
    }

    container.addEventListener('scroll', handleScrollEvent, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScrollEvent)
    }
  }, [handleScroll])

  // Programmatic scroll to video
  const scrollToVideo = useCallback((index: number) => {
    if (!scrollerRef.current || index < 0 || index >= videos.length) return

    const container = scrollerRef.current
    const targetScroll = index * container.clientHeight

    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
  }, [videos.length])

  // Swipe handlers for touch devices
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (currentIndex < videos.length - 1) {
        scrollToVideo(currentIndex + 1)
      }
    },
    onSwipedDown: () => {
      if (currentIndex > 0) {
        scrollToVideo(currentIndex - 1)
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum distance for swipe
  })

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case ' ': // Spacebar
          e.preventDefault()
          if (currentIndex < videos.length - 1) {
            scrollToVideo(currentIndex + 1)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (currentIndex > 0) {
            scrollToVideo(currentIndex - 1)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, videos.length, scrollToVideo])

  // Mouse wheel handling for desktop
  useEffect(() => {
    if (isTouch) return

    let wheelTimeout: NodeJS.Timeout
    let isWheeling = false

    const handleWheel = (e: WheelEvent) => {
      if (!scrollerRef.current) return
      
      e.preventDefault()
      
      if (!isWheeling) {
        isWheeling = true
        
        if (e.deltaY > 0 && currentIndex < videos.length - 1) {
          scrollToVideo(currentIndex + 1)
        } else if (e.deltaY < 0 && currentIndex > 0) {
          scrollToVideo(currentIndex - 1)
        }
      }

      clearTimeout(wheelTimeout)
      wheelTimeout = setTimeout(() => {
        isWheeling = false
      }, 500) // Debounce wheel events
    }

    const container = scrollerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
      clearTimeout(wheelTimeout)
    }
  }, [currentIndex, videos.length, scrollToVideo, isTouch])

  const containerProps = isTouch ? swipeHandlers : {}
  
  return (
    <div
      {...containerProps}
      ref={scrollerRef}
      className={cn(
        'h-viewport w-full overflow-y-auto overflow-x-hidden',
        'snap-y snap-mandatory scroll-smooth',
        'scrollbar-hide', // Hide scrollbar but keep functionality
        className
      )}
    >
      {videos.map((video, index) => (
        <VideoItem
          key={video.id}
          video={video}
          index={index}
          isActive={index === currentIndex}
          onScrollTo={() => scrollToVideo(index)}
        />
      ))}
    </div>
  )
}

// Individual video item component
interface VideoItemProps {
  video: Video
  index: number
  isActive: boolean
  onScrollTo: () => void
}

function VideoItem({ video, index, isActive }: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const hasStartedPlaybackRef = useRef(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showMuteIcon, setShowMuteIcon] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { hasUserInteracted, setHasUserInteracted } = useInteraction()

  // Initialize HLS for .m3u8 streams
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !video.src) return

    const isHLS = video.src.includes('.m3u8')
    
    if (isHLS) {
      if (Hls.isSupported()) {
        // Use HLS.js with aggressive quality settings
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
          maxBufferLength: 60, // 60 seconds
          // Force highest quality from start
          startLevel: 9999, // Force highest level
          capLevelToPlayerSize: false,
          // Aggressive bandwidth estimation
          abrEwmaDefaultEstimate: 10000000, // 10 Mbps
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.7,
          abrMaxWithRealBitrate: true,
          testBandwidth: false,
          startFragPrefetch: true,
        })
        
        hlsRef.current = hls
        hls.loadSource(video.src)
        hls.attachMedia(videoElement)
        
        // Reset playback state for this video
        hasStartedPlaybackRef.current = false
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('HLS manifest loaded for video:', video.id, 'Levels:', data.levels.length)
          
          // Force highest quality immediately
          if (data.levels.length > 0) {
            const highestLevel = data.levels.length - 1
            console.log('Forcing highest quality level:', highestLevel, data.levels[highestLevel])
            hls.nextLevel = highestLevel
            hls.currentLevel = highestLevel
            hls.loadLevel = highestLevel
          }
          
          setIsLoading(false)
        })
        
        // Remove complex fragment loading logic - just rely on the timeout
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error:', data)
            setHasError(true)
            setIsLoading(false)
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error')
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error')
                hls.recoverMediaError()
                break
              default:
                hls.destroy()
                break
            }
          }
        })
        
        return () => {
          hls.destroy()
          hlsRef.current = null
        }
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoElement.src = video.src
        setIsLoading(false)
      } else {
        console.error('HLS is not supported in this browser')
        setHasError(true)
        setIsLoading(false)
      }
    } else {
      // Regular video file
      videoElement.src = video.src
      setIsLoading(false)
    }
  }, [video.src, video.id])

  // Auto-play/pause based on visibility
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    console.log(`[Video ${index}] Active state changed: ${isActive}`)

    if (isActive) {
      // Stop any other playing videos immediately
      const allVideos = document.querySelectorAll('video')
      allVideos.forEach(v => {
        if (v !== videoElement) {
          v.pause()
          v.currentTime = 0
        }
      })

      // Set mute state
      videoElement.muted = !hasUserInteracted
      setIsMuted(!hasUserInteracted)
      
      // Ensure video is loaded before playing
      const attemptPlay = () => {
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
          const playPromise = videoElement.play()
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.log('Autoplay prevented:', err)
              // Try playing muted if unmuted autoplay fails
              if (!videoElement.muted) {
                videoElement.muted = true
                setIsMuted(true)
                videoElement.play().catch(e => console.log('Muted autoplay also failed:', e))
              }
            })
          }
        } else {
          // Wait for video to be ready
          videoElement.addEventListener('loadeddata', attemptPlay, { once: true })
        }
      }
      
      attemptPlay()
    } else {
      // Pause and reset video when it's not active
      if (videoElement) {
        videoElement.pause()
        videoElement.currentTime = 0
        hasStartedPlaybackRef.current = false
      }
    }
  }, [isActive, hasUserInteracted, video.src])

  // Handle tap/click to toggle mute state
  const handleInteraction = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isMuted) {
      // Unmute
      videoElement.muted = false
      setIsMuted(false)
      setHasUserInteracted(true)
      
      // Show unmute icon briefly
      setShowMuteIcon(true)
      setTimeout(() => setShowMuteIcon(false), 1000)
    } else {
      // Mute
      videoElement.muted = true
      setIsMuted(true)
      
      // Show mute icon briefly
      setShowMuteIcon(true)
      setTimeout(() => setShowMuteIcon(false), 1000)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  return (
    <div 
      className="video-container snap-start snap-always relative flex items-center justify-center bg-black"
      data-video-index={index}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Video wrapper with aspect ratio preservation */}
      <div className="video-aspect-wrapper">
        <div className="video-border-container">
          <video
            key={`video-${video.id}-${index}`}
            ref={videoRef}
            poster={video.poster}
            autoPlay={false} // We control this manually
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            className="h-full w-full object-contain"
        onLoadStart={() => {
          console.log('Video load started:', video.id)
          // Don't set loading for HLS streams, HLS.js will handle it
          if (!video.src.includes('.m3u8')) {
            setIsLoading(true)
            setHasError(false)
          }
        }}
        onLoadedData={() => {
          console.log('Video loaded:', video.id)
          // Don't set loading for HLS streams, HLS.js will handle it
          if (!video.src.includes('.m3u8')) {
            setIsLoading(false)
          }
        }}
        onError={(e) => {
          const videoElement = e.currentTarget as HTMLVideoElement
          const error = videoElement.error
          console.error('Video error:', video.id, 'Code:', error?.code, 'Message:', error?.message)
          
          // Only set error for non-HLS streams, HLS.js handles its own errors
          if (!video.src.includes('.m3u8')) {
            setHasError(true)
            setIsLoading(false)
          }
        }}
          />
        </div>
      </div>
      
      {/* Mute/Unmute indicator */}
      {showMuteIcon && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur rounded-full p-4 animate-fade-out">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              {isMuted ? (
                // Muted icon
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                // Unmuted icon
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
          </div>
        </div>
      )}
      
      {/* Tap to unmute prompt for first video */}
      {isActive && isMuted && index === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/70 backdrop-blur rounded-lg px-4 py-2 animate-pulse">
            <p className="text-white text-sm">Tap to unmute</p>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75">
          <div className="text-center text-white p-4">
            <p className="text-sm mb-2">Unable to load video</p>
            <p className="text-xs text-white/60">Video {video.id}</p>
          </div>
        </div>
      )}
      
      {/* Video metadata overlay */}
      <div className="absolute bottom-20 left-4 right-20 z-20 pointer-events-none">
        <div className="text-white">
          <p className="font-semibold mb-1">@{video.username}</p>
          <p className="text-sm opacity-90">{video.description}</p>
        </div>
      </div>

      {/* Interaction buttons */}
      <div className="absolute right-4 bottom-20 z-20 flex flex-col gap-4">
        <InteractionButton
          icon="❤️"
          count={video.likes}
          onClick={() => console.log('Like video', video.id)}
        />
        <InteractionButton
          icon="💬"
          count={video.comments}
          onClick={() => console.log('Comment on video', video.id)}
        />
        <InteractionButton
          icon="↗️"
          count={video.shares}
          onClick={() => console.log('Share video', video.id)}
        />
      </div>
    </div>
  )
}

// Interaction button component
interface InteractionButtonProps {
  icon: string
  count: number
  onClick: () => void
}

function InteractionButton({ icon, count, onClick }: InteractionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 touch-target"
    >
      <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-2xl hover:bg-white/20 transition-colors">
        {icon}
      </div>
      <span className="text-white text-xs font-medium">
        {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    </button>
  )
}