'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Hls from 'hls.js'
import { cn } from '@/lib/utils'
import { useInteraction } from '@/contexts/InteractionContext'
import { useDevice } from '@/contexts/DeviceContext'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

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

// Global variable to track the currently playing video
let globalPlayingVideo: HTMLVideoElement | null = null

export function VideoScroller({ videos, className, onVideoChange }: VideoScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle scroll to detect current video
  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / containerHeight)
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentIndex(newIndex)
        onVideoChange?.(newIndex, videos[newIndex])
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentIndex, videos, onVideoChange])

  return (
    <div
      ref={scrollerRef}
      className={cn(
        'h-full w-full overflow-y-auto overflow-x-hidden',
        'snap-y snap-mandatory scroll-smooth',
        'scrollbar-hide bg-black',
        className
      )}
    >
      {/* Desktop only: Add padding for centering */}
      <div className="hidden md:block pointer-events-none" style={{ height: '50vh', scrollSnapAlign: 'none' }} />
      
      {videos.map((video, index) => (
        <VideoItem
          key={video.id}
          video={video}
          index={index}
          isActive={index === currentIndex}
        />
      ))}
      
      {/* Desktop only: Add padding at the end */}
      <div className="hidden md:block pointer-events-none" style={{ height: '50vh', scrollSnapAlign: 'none' }} />
    </div>
  )
}

interface VideoItemProps {
  video: Video
  index: number
  isActive: boolean
}

function VideoItem({ video, index, isActive }: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [showMuteIcon, setShowMuteIcon] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null)
  const { hasUserInteracted, setHasUserInteracted } = useInteraction()
  const { isMobile } = useDevice()

  // Initialize video source
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !video.src) return

    const isHLS = video.src.includes('.m3u8')
    
    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
      })
      
      hlsRef.current = hls
      hls.loadSource(video.src)
      hls.attachMedia(videoElement)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
      })
      
      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    } else {
      videoElement.src = video.src
      setIsLoading(false)
    }
  }, [video.src])

  // Handle play/pause based on active state
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const playVideo = async () => {
      // First, pause any other playing video
      if (globalPlayingVideo && globalPlayingVideo !== videoElement) {
        globalPlayingVideo.pause()
        globalPlayingVideo.currentTime = 0
      }

      // Update global reference
      globalPlayingVideo = videoElement

      // Set mute state
      videoElement.muted = !hasUserInteracted
      setIsMuted(!hasUserInteracted)

      // Try to play
      try {
        await videoElement.play()
      } catch (err: any) {
        if (err.name === 'NotAllowedError' && !videoElement.muted) {
          videoElement.muted = true
          setIsMuted(true)
          try {
            await videoElement.play()
          } catch (e) {
            console.error('Failed to play video:', e)
          }
        }
      }
    }

    if (isActive) {
      // Delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (isActive) playVideo()
      }, 400)
      return () => clearTimeout(timer)
    } else {
      // Pause if not active
      if (videoElement === globalPlayingVideo) {
        videoElement.pause()
        videoElement.currentTime = 0
        globalPlayingVideo = null
      }
    }
  }, [isActive, hasUserInteracted])

  // Handle mute toggle
  const handleInteraction = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    videoElement.muted = !videoElement.muted
    setIsMuted(videoElement.muted)
    
    if (!videoElement.muted) {
      setHasUserInteracted(true)
    }

    setShowMuteIcon(true)
    setTimeout(() => setShowMuteIcon(false), 1000)
  }

  return (
    <div 
      className="video-container snap-center snap-always relative flex items-center justify-center bg-black overflow-hidden"
      style={{ backgroundColor: '#000' }}
      onClick={handleInteraction}
    >
      {/* Full black background layers */}
      <div className="absolute inset-0 bg-black" style={{ backgroundColor: '#000000' }} />
      <div className="absolute inset-0 bg-black z-[1]" />
      
      {/* Video wrapper that fills entire container */}
      <div className={cn(
        "absolute inset-0 z-[2]",
        !isMobile && "flex items-center justify-center"
      )}>
        <video
          ref={videoRef}
          muted={isMuted}
          loop
          playsInline
          preload="auto"
          className={cn(
            "h-full w-full",
            isMobile ? "object-cover" : "object-contain"
          )}
          style={{ backgroundColor: '#000000' }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            const ratio = video.videoWidth / video.videoHeight;
            setVideoAspectRatio(ratio);
          }}
        />
      </div>

      {/* Mute indicator */}
      {showMuteIcon && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur rounded-full p-4 animate-fade-out">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              {isMuted ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Desktop Only: Thumbs up/down icons */}
      {!isMobile && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[10]"
          style={{ left: 'calc(50% + min(50vw, 50vh * 9 / 16) + 10px)' }}
        >
          <button className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition group">
            <ThumbsUp className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition group">
            <ThumbsDown className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

    </div>
  )
}