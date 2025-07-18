'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
import { colors, colorClasses } from '@/config/colors'

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
  const [globalUnmuted, setGlobalUnmuted] = useState(false) // Track if user has ever unmuted

  // Dead simple scroll detection
  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / containerHeight)
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        console.log(`[SCROLLER] 📱 Scrolled to video ${newIndex + 1}/${videos.length} - @${videos[newIndex].username}`)
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
      className={`h-full w-full overflow-y-scroll snap-y snap-mandatory bg-white ${className || ''}`}
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
          globalUnmuted={globalUnmuted}
          onUnmute={() => setGlobalUnmuted(true)}
        />
      ))}
    </div>
  )
}

interface VideoItemProps {
  video: Video
  index: number
  isActive: boolean
  globalUnmuted: boolean
  onUnmute: () => void
}

function VideoItemFresh({ video, index, isActive, globalUnmuted, onUnmute }: VideoItemProps) {
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

    console.log(`[VIDEO] 🎬 Setting up video ${index + 1} - @${video.username}: "${video.description}"`)
    
    const isHLS = video.src.includes('.m3u8')
    
    if (isHLS) {
      if (Hls.isSupported()) {
        console.log(`[HLS] 🔧 Using HLS.js for video ${index + 1}`)
        
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
          console.log(`[HLS] ✅ Ready for video ${index + 1} - @${video.username}`)
          setIsLoading(false)
          setError(null)
        })
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error(`[HLS] ❌ Error for video ${index + 1} - @${video.username}:`, data)
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
        console.log(`[HLS] 🍎 Using native Safari HLS for video ${index + 1}`)
        videoElement.src = video.src
        
        const handleCanPlay = () => {
          console.log(`[HLS] ✅ Native Safari ready for video ${index + 1} - @${video.username}`)
          setIsLoading(false)
          setError(null)
        }
        
        const handleError = (e: any) => {
          console.error(`[HLS] ❌ Native Safari error for video ${index + 1} - @${video.username}:`, e)
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
      console.log(`[VIDEO] 📹 Using regular video for video ${index + 1}`)
      videoElement.src = video.src
      
      const handleCanPlay = () => {
        console.log(`[VIDEO] ✅ Regular video ready for video ${index + 1} - @${video.username}`)
        setIsLoading(false)
        setError(null)
      }
      
      const handleError = (e: any) => {
        console.error(`[VIDEO] ❌ Regular video error for video ${index + 1} - @${video.username}:`, e)
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

  // Simple play/pause with persistent unmute behavior
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isActive && !isLoading && !error) {
      // If globally unmuted or user has interacted with this video, start unmuted
      const shouldBeUnmuted = globalUnmuted || hasInteracted
      const muteStatus = shouldBeUnmuted ? '🔊' : '🔇'
      console.log(`[PLAYBACK] ▶️ Playing video ${index + 1} ${muteStatus} - @${video.username}`)
      
      videoElement.muted = !shouldBeUnmuted
      setIsMuted(!shouldBeUnmuted)
      
      videoElement.play().catch((err) => {
        console.log(`[PLAYBACK] 🔇 Play failed, retrying muted - ${err.message}`)
        videoElement.muted = true
        setIsMuted(true)
        videoElement.play().catch(console.error)
      })
    } else {
      console.log(`[PLAYBACK] ⏸️ Pausing video ${index + 1} - @${video.username}`)
      videoElement.pause()
      // Mute when scrolling away to prevent background audio
      if (videoElement) {
        videoElement.muted = true
        setIsMuted(true)
      }
    }
  }, [isActive, hasInteracted, globalUnmuted, index, isLoading, error])

  const handleClick = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (!hasInteracted) {
      setHasInteracted(true)
      videoElement.muted = false
      setIsMuted(false)
      onUnmute() // Trigger global unmute for all future videos
    } else {
      const newMuted = !videoElement.muted
      videoElement.muted = newMuted
      setIsMuted(newMuted)
      
      // If user unmutes after initial interaction, also trigger global unmute
      if (!newMuted) {
        onUnmute()
      }
    }
  }

  return (
    <div 
      className="snap-start h-screen w-full relative bg-white flex items-center justify-center"
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
      
      {/* Category overlay - positioned with percentage for responsive placement */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[7%] md:top-[12%] left-[5%] z-40">
          <span className="text-sm font-medium capitalize text-white bg-black/50 px-3 py-1.5 rounded-md">Photographers</span>
        </div>
      </div>
      
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

      {/* Vendor button - positioned well above mobile navigation */}
      <Link 
        href="#" 
        className="absolute bottom-56 md:bottom-[140px] left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center gap-1"
      >
        <div className={`${colorClasses.bgAccent} ${colorClasses.textPrimary} px-4 py-2 rounded-md ${colorClasses.hoverAccent} transition`}>
          <h3 className="text-base font-semibold">Explore Vendor</h3>
        </div>
        <span className={`text-sm ${colorClasses.textSecondary}`}>example.com</span>
      </Link>

      {/* Mute indicator */}
      {isMuted && isActive && !isLoading && !error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded">
            {globalUnmuted ? 'Tap to toggle sound' : 'Tap to unmute'}
          </div>
        </div>
      )}
    </div>
  )
}