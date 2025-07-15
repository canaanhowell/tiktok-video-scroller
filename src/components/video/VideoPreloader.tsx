'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPreloaderProps {
  videos: Array<{ id: string; src: string }>
  currentIndex: number
  preloadRange?: number // How many videos ahead/behind to preload
}

export function VideoPreloader({ 
  videos, 
  currentIndex, 
  preloadRange = 1 
}: VideoPreloaderProps) {
  const preloadersRef = useRef<Map<string, Hls | HTMLVideoElement>>(new Map())

  useEffect(() => {
    // Clear old preloaders not in range
    const currentPreloaders = preloadersRef.current
    const indicesToPreload = new Set<number>()

    // Calculate which videos to preload
    for (let i = -preloadRange; i <= preloadRange; i++) {
      const index = currentIndex + i
      if (index >= 0 && index < videos.length) {
        indicesToPreload.add(index)
      }
    }

    // Remove preloaders outside of range
    currentPreloaders.forEach((preloader, videoId) => {
      const videoIndex = videos.findIndex(v => v.id === videoId)
      if (!indicesToPreload.has(videoIndex)) {
        if (preloader instanceof Hls) {
          preloader.destroy()
        }
        currentPreloaders.delete(videoId)
      }
    })

    // Add new preloaders
    indicesToPreload.forEach(index => {
      const video = videos[index]
      if (!currentPreloaders.has(video.id)) {
        preloadVideo(video.id, video.src)
      }
    })

    // Cleanup function
    return () => {
      currentPreloaders.forEach(preloader => {
        if (preloader instanceof Hls) {
          preloader.destroy()
        }
      })
      currentPreloaders.clear()
    }
  }, [currentIndex, videos, preloadRange])

  const preloadVideo = (videoId: string, src: string) => {
    // Create a hidden video element for preloading
    const video = document.createElement('video')
    video.style.display = 'none'
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    
    document.body.appendChild(video)

    if (Hls.isSupported() && src.includes('.m3u8')) {
      // HLS video
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10, // Only buffer 10 seconds
        maxBufferSize: 10 * 1000 * 1000, // 10MB
      })

      hls.loadSource(src)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Start loading the first few segments
        video.currentTime = 0.1
      })

      preloadersRef.current.set(videoId, hls)
    } else {
      // Regular video
      video.src = src
      video.load()
      preloadersRef.current.set(videoId, video)
    }

    // Remove the video element after preloading
    video.addEventListener('loadeddata', () => {
      setTimeout(() => {
        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }
      }, 1000)
    })
  }

  return null // This component doesn't render anything
}

// Hook to manage video preloading
export function useVideoPreloader(
  videos: Array<{ id: string; src: string }>,
  currentIndex: number,
  options?: {
    preloadRange?: number
    enabled?: boolean
  }
) {
  const { preloadRange = 1, enabled = true } = options || {}
  
  useEffect(() => {
    if (!enabled) return

    // Get videos to preload
    const videosToPreload: typeof videos = []
    
    for (let i = -preloadRange; i <= preloadRange; i++) {
      const index = currentIndex + i
      if (index >= 0 && index < videos.length && index !== currentIndex) {
        videosToPreload.push(videos[index])
      }
    }

    // Simple preload using link prefetch
    videosToPreload.forEach(video => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = video.src
      link.as = 'fetch'
      link.crossOrigin = 'anonymous'
      
      document.head.appendChild(link)
      
      // Cleanup after a delay
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link)
        }
      }, 30000) // Remove after 30 seconds
    })
  }, [currentIndex, videos, preloadRange, enabled])
}