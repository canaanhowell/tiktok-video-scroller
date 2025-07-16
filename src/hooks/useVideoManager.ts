import { useRef, useCallback } from 'react'

interface VideoManager {
  currentVideo: HTMLVideoElement | null
  playVideo: (video: HTMLVideoElement, muted: boolean) => Promise<void>
  pauseVideo: (video: HTMLVideoElement) => void
  pauseAllVideos: () => void
}

export function useVideoManager(): VideoManager {
  const currentVideoRef = useRef<HTMLVideoElement | null>(null)
  const playingPromiseRef = useRef<Promise<void> | null>(null)

  const pauseAllVideos = useCallback(() => {
    // Pause all videos on the page
    document.querySelectorAll('video').forEach(v => {
      v.pause()
      v.currentTime = 0
    })
    currentVideoRef.current = null
    playingPromiseRef.current = null
  }, [])

  const pauseVideo = useCallback((video: HTMLVideoElement) => {
    if (video === currentVideoRef.current) {
      video.pause()
      video.currentTime = 0
      currentVideoRef.current = null
      playingPromiseRef.current = null
    }
  }, [])

  const playVideo = useCallback(async (video: HTMLVideoElement, muted: boolean) => {
    // If there's a video currently playing, stop it first
    if (currentVideoRef.current && currentVideoRef.current !== video) {
      currentVideoRef.current.pause()
      currentVideoRef.current.currentTime = 0
    }

    // Wait for any pending play operations to complete
    if (playingPromiseRef.current) {
      try {
        await playingPromiseRef.current
      } catch (e) {
        // Ignore errors from previous play attempts
      }
    }

    // Now play the new video
    currentVideoRef.current = video
    video.muted = muted
    
    try {
      playingPromiseRef.current = video.play()
      await playingPromiseRef.current
      console.log('Video playing successfully')
    } catch (err: any) {
      console.log('Play failed:', err.message)
      
      // If unmuted play fails due to autoplay policy, try muted
      if (!video.muted && err.name === 'NotAllowedError') {
        video.muted = true
        try {
          playingPromiseRef.current = video.play()
          await playingPromiseRef.current
          console.log('Muted play succeeded')
        } catch (e) {
          console.log('Muted play also failed:', e)
        }
      }
    } finally {
      playingPromiseRef.current = null
    }
  }, [])

  return {
    currentVideo: currentVideoRef.current,
    playVideo,
    pauseVideo,
    pauseAllVideos
  }
}