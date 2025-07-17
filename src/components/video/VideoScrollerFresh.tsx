'use client'

import { useRef, useState, useEffect } from 'react'
import Hls from 'hls.js'

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

export function VideoScrollerFresh({ videos, className, onVideoChange }: VideoScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Dead simple scroll detection
  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / containerHeight)
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        console.log(`[FRESH] Changed to video ${newIndex + 1}`)
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
      className={`h-full w-full overflow-y-scroll snap-y snap-mandatory bg-black ${className || ''}`}
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {videos.map((video, index) => (
        <VideoItemFresh
          key={video.id}
          video={video}
          index={index}
          isActive={index === currentIndex}
        />
      ))}
    </div>
  )
}

interface VideoItemProps {
  video: Video
  index: number
  isActive: boolean
}

function VideoItemFresh({ video, index, isActive }: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simple but functional HLS setup
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    console.log(`[FRESH] Setting up video ${index + 1}`)
    
    const isHLS = video.src.includes('.m3u8')
    
    if (isHLS) {
      if (Hls.isSupported()) {
        console.log(`[FRESH] Using HLS.js for video ${index + 1}`)
        
        // Clean up existing HLS
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
        }
        
        // Create minimal HLS instance
        const hls = new Hls({
          enableWorker: false,
          debug: false,
          maxBufferLength: 20,
          maxBufferSize: 30 * 1000 * 1000,
          manifestLoadingTimeOut: 10000,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 20000,
        })
        
        hlsRef.current = hls
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log(`[FRESH] HLS ready for video ${index + 1}`)
          setIsLoading(false)
          setError(null)
        })
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error(`[FRESH] HLS error for video ${index + 1}:`, data)
          if (data.fatal) {
            setError(`Video error: ${data.details || 'Unknown error'}`)
            setIsLoading(false)
          }
        })
        
        hls.loadSource(video.src)
        hls.attachMedia(videoElement)
        
        return () => {
          if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
          }
        }
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log(`[FRESH] Using native HLS for video ${index + 1}`)
        videoElement.src = video.src
        
        const handleCanPlay = () => {
          console.log(`[FRESH] Native HLS ready for video ${index + 1}`)
          setIsLoading(false)
          setError(null)
        }
        
        const handleError = (e: any) => {
          console.error(`[FRESH] Native HLS error for video ${index + 1}:`, e)
          setError('Video loading failed')
          setIsLoading(false)
        }
        
        videoElement.addEventListener('canplay', handleCanPlay)
        videoElement.addEventListener('error', handleError)
        
        return () => {
          videoElement.removeEventListener('canplay', handleCanPlay)
          videoElement.removeEventListener('error', handleError)
        }
      } else {
        setError('HLS not supported')
        setIsLoading(false)
      }
    } else {
      console.log(`[FRESH] Using regular video for video ${index + 1}`)
      videoElement.src = video.src
      
      const handleCanPlay = () => {
        console.log(`[FRESH] Regular video ready for video ${index + 1}`)
        setIsLoading(false)
        setError(null)
      }
      
      const handleError = (e: any) => {
        console.error(`[FRESH] Regular video error for video ${index + 1}:`, e)
        setError('Video loading failed')
        setIsLoading(false)
      }
      
      videoElement.addEventListener('canplay', handleCanPlay)
      videoElement.addEventListener('error', handleError)
      
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay)
        videoElement.removeEventListener('error', handleError)
      }
    }
  }, [video.src, index])

  // Simple play/pause
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isActive && !isLoading && !error) {
      console.log(`[FRESH] Playing video ${index + 1}`)
      videoElement.muted = !hasInteracted
      setIsMuted(!hasInteracted)
      
      videoElement.play().catch((err) => {
        console.log(`[FRESH] Play failed, trying muted:`, err.message)
        videoElement.muted = true
        setIsMuted(true)
        videoElement.play().catch(console.error)
      })
    } else {
      console.log(`[FRESH] Pausing video ${index + 1}`)
      videoElement.pause()
    }
  }, [isActive, hasInteracted, index, isLoading, error])

  const handleClick = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (!hasInteracted) {
      setHasInteracted(true)
      videoElement.muted = false
      setIsMuted(false)
    } else {
      const newMuted = !videoElement.muted
      videoElement.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  return (
    <div 
      className="snap-start h-screen w-full relative bg-black flex items-center justify-center"
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
      />
      
      {/* Loading indicator */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
            <div className="text-white text-sm">Loading video {index + 1}</div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 text-white p-4 rounded max-w-sm text-center">
            <div className="font-bold">Video {index + 1} Error</div>
            <div className="text-sm mt-2">{error}</div>
          </div>
        </div>
      )}
      
      {/* Simple overlay */}
      <div className="absolute bottom-20 left-4 text-white pointer-events-none">
        <p className="font-bold text-lg">@{video.username}</p>
        <p className="text-sm opacity-90">{video.description}</p>
      </div>

      {/* Mute indicator */}
      {isMuted && isActive && !isLoading && !error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded">
            Tap to unmute
          </div>
        </div>
      )}
    </div>
  )
}