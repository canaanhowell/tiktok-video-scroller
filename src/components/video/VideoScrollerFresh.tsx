'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
import { Heart, Share2 } from 'lucide-react'
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
  deviceType?: 'mobile' | 'desktop' | 'tablet'
}

export function VideoScrollerFresh({ videos, className, onVideoChange, deviceType = 'mobile' }: VideoScrollerProps) {
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
          deviceType={deviceType}
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
  deviceType?: 'mobile' | 'desktop' | 'tablet'
}

function VideoItemFresh({ video, index, isActive, globalUnmuted, onUnmute, deviceType = 'mobile' }: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isShared, setIsShared] = useState(false)

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent video click
    setIsLiked(!isLiked)
    // TODO: Send like to backend with video.id
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent video click
    setIsShared(true)
    // TODO: Implement share functionality with video metadata
    // For now, just copy link to clipboard
    navigator.clipboard.writeText(window.location.origin + '/video/' + video.id)
  }

  return (
    <div 
      className="snap-start h-screen w-full relative bg-black flex items-center justify-center"
    >
      {/* Video container */}
      <div ref={containerRef} className="relative h-full w-full flex items-center justify-center -mt-[12%] md:mt-0" onClick={handleClick}>
        <video
          ref={videoRef}
          className={`h-full w-full ${deviceType === 'desktop' ? 'object-cover' : 'object-cover md:object-contain'}`}
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
        />
        
        {/* Category overlay - fixed to top left of video */}
        <div className="absolute top-[7%] md:top-[13%] left-[6%] z-40 pointer-events-none">
          <span className="text-sm font-medium capitalize text-white bg-black/50 px-3 py-1.5 rounded-md">Photographers</span>
        </div>
        
        {/* Vendor button - fixed to bottom center of video */}
        <Link 
          href="#" 
          className="absolute bottom-[23%] md:bottom-[5%] left-1/2 transform -translate-x-1/2 z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-[#f4c82d]/95 ${colorClasses.textPrimary} px-4 py-2 rounded-md hover:bg-[#f4c82d] transition flex flex-col items-center gap-1 w-[200px] md:w-auto`}>
            <h3 className="text-base font-semibold">Explore Vendor</h3>
            <span className="text-sm">example.com</span>
          </div>
        </Link>
        
        {/* Dual button logic - commented out for now */}
        {/* <div className="absolute bottom-[23%] md:bottom-[5%] left-0 right-0 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-40 flex gap-2 justify-center px-[2.5vw] md:px-0 md:w-auto">
          <Link 
            href="#" 
            className="block flex-1 md:flex-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-[#f4c82d]/95 ${colorClasses.textPrimary} px-3 md:px-4 py-2 rounded-md hover:bg-[#f4c82d] transition flex flex-col items-center gap-1 min-w-[150px] md:w-auto`}>
              <h3 className="text-sm md:text-base font-semibold whitespace-nowrap">Explore Vendor Website</h3>
              <span className="text-xs md:text-sm">example.com</span>
            </div>
          </Link>
          <Link 
            href="#" 
            className="block flex-1 md:flex-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-[#dadde2]/95 ${colorClasses.textPrimary} px-3 md:px-4 py-2 rounded-md hover:bg-[#dadde2] transition flex flex-col items-center gap-1 min-w-[150px] md:w-auto`}>
              <h3 className="text-sm md:text-base font-semibold whitespace-nowrap">Explore Vendor Website</h3>
              <span className="text-xs md:text-sm">music.com</span>
            </div>
          </Link>
        </div> */}
      </div>
      
      {/* Action buttons - positioned inside video container */}
      {isActive && (
        <div 
          className="hidden md:flex absolute top-1/2 transform -translate-y-1/2 right-[3%] flex-col gap-4 z-40"
        >
          <button 
            onClick={handleLike}
            className={`p-3 rounded-full transition ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-black/50 hover:bg-black/70'}`}
            aria-label="Like video"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition"
            aria-label="Share video"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
      
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


      {/* Mute indicator */}
      {isMuted && isActive && !isLoading && !error && (
        <div className="absolute top-[10%] right-4 pointer-events-none">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
            {globalUnmuted ? 'Tap to toggle sound' : 'Tap to unmute'}
          </div>
        </div>
      )}
    </div>
  )
}