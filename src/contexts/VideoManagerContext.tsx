'use client'

import React, { createContext, useContext, useRef, useCallback } from 'react'

interface VideoManagerContextType {
  playVideo: (video: HTMLVideoElement, muted: boolean, videoId: string) => Promise<void>
  pauseVideo: (video: HTMLVideoElement) => void
  isCurrentVideo: (videoId: string) => boolean
}

const VideoManagerContext = createContext<VideoManagerContextType | null>(null)

export function VideoManagerProvider({ children }: { children: React.ReactNode }) {
  const currentVideoRef = useRef<HTMLVideoElement | null>(null)
  const currentVideoIdRef = useRef<string | null>(null)
  const playingPromiseRef = useRef<Promise<void> | null>(null)
  const lastOperationTimeRef = useRef<number>(0)

  const pauseVideo = useCallback((video: HTMLVideoElement) => {
    if (video === currentVideoRef.current) {
      video.pause()
      video.currentTime = 0
      currentVideoRef.current = null
      currentVideoIdRef.current = null
      playingPromiseRef.current = null
    }
  }, [])

  const playVideo = useCallback(async (video: HTMLVideoElement, muted: boolean, videoId: string) => {
    console.log(`[VideoManager] Request to play video: ${videoId}`)
    
    // Debounce rapid play requests
    const now = Date.now()
    const timeSinceLastOperation = now - lastOperationTimeRef.current
    if (timeSinceLastOperation < 300) {
      console.log(`[VideoManager] Debouncing play request for ${videoId} (only ${timeSinceLastOperation}ms since last operation)`)
      return
    }
    lastOperationTimeRef.current = now
    
    // If this is already the current video, do nothing
    if (currentVideoIdRef.current === videoId && currentVideoRef.current === video) {
      console.log(`[VideoManager] Video ${videoId} is already playing`)
      return
    }

    // Stop any currently playing video
    if (currentVideoRef.current && currentVideoRef.current !== video) {
      console.log(`[VideoManager] Stopping current video: ${currentVideoIdRef.current}`)
      currentVideoRef.current.pause()
      currentVideoRef.current.currentTime = 0
    }

    // Wait for any pending play operations
    if (playingPromiseRef.current) {
      console.log(`[VideoManager] Waiting for pending play operation`)
      try {
        await playingPromiseRef.current
      } catch (e) {
        // Ignore errors from previous play attempts
      }
      // Add a small delay after the previous operation completes
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Update references
    currentVideoRef.current = video
    currentVideoIdRef.current = videoId
    video.muted = muted
    
    try {
      console.log(`[VideoManager] Starting play for video: ${videoId}`)
      playingPromiseRef.current = video.play()
      await playingPromiseRef.current
      console.log(`[VideoManager] Video ${videoId} playing successfully`)
    } catch (err: any) {
      console.log(`[VideoManager] Play failed for ${videoId}:`, err.message)
      
      // Only retry with muted if it's an autoplay policy issue
      if (!video.muted && err.name === 'NotAllowedError') {
        video.muted = true
        try {
          playingPromiseRef.current = video.play()
          await playingPromiseRef.current
          console.log(`[VideoManager] Muted play succeeded for ${videoId}`)
        } catch (e: any) {
          console.log(`[VideoManager] Muted play also failed for ${videoId}:`, e.message)
          currentVideoRef.current = null
          currentVideoIdRef.current = null
        }
      } else {
        // Clear references if play failed
        currentVideoRef.current = null
        currentVideoIdRef.current = null
      }
    } finally {
      playingPromiseRef.current = null
    }
  }, [])

  const isCurrentVideo = useCallback((videoId: string) => {
    return currentVideoIdRef.current === videoId
  }, [])

  return (
    <VideoManagerContext.Provider value={{ playVideo, pauseVideo, isCurrentVideo }}>
      {children}
    </VideoManagerContext.Provider>
  )
}

export function useVideoManager() {
  const context = useContext(VideoManagerContext)
  if (!context) {
    throw new Error('useVideoManager must be used within VideoManagerProvider')
  }
  return context
}