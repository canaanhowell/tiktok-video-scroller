'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { VideoScrollerFresh } from '@/components/video/VideoScrollerFresh'
import { Typography } from '@/components/ui/Typography'
import { videoService } from '@/services/videos'
import { useDeviceType } from '@/hooks/useDeviceType'

// Your actual Bunny CDN videos - Updated July 16, 2025
const bunnyVideos = [
  {
    id: 'b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f',
    src: 'https://vz-97606b97-31d.b-cdn.net/b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f/playlist.m3u8',
    username: 'synthetikmedia',
    description: 'Romance Wedding Video 1 💕',
    likes: 1234,
    comments: 56,
    shares: 12,
  },
  {
    id: '755f7bdc-2026-4037-b15d-469397e29010',
    src: 'https://vz-97606b97-31d.b-cdn.net/755f7bdc-2026-4037-b15d-469397e29010/playlist.m3u8',
    username: 'synthetikmedia',
    description: 'Romantic Moments 💍',
    likes: 5678,
    comments: 234,
    shares: 89,
  },
  {
    id: '533f6ad4-cf07-4846-b232-c7f79dce11a5',
    src: 'https://vz-97606b97-31d.b-cdn.net/533f6ad4-cf07-4846-b232-c7f79dce11a5/playlist.m3u8',
    username: 'synthetikmedia',
    description: 'Wedding Celebration 🎊',
    likes: 9012,
    comments: 345,
    shares: 123,
  },
  {
    id: 'ab57b1fe-df73-4bcc-8f57-b7869519b62d',
    src: 'https://vz-97606b97-31d.b-cdn.net/ab57b1fe-df73-4bcc-8f57-b7869519b62d/playlist.m3u8',
    username: 'synthetikmedia',
    description: 'Love Story 💖',
    likes: 3456,
    comments: 123,
    shares: 45,
  },
  {
    id: '67254311-41da-4200-a59c-429995a0755f',
    src: 'https://vz-97606b97-31d.b-cdn.net/67254311-41da-4200-a59c-429995a0755f/playlist.m3u8',
    username: 'synthetikmedia',
    description: 'Forever Together 👰🤵',
    likes: 7890,
    comments: 456,
    shares: 234,
  },
]

// Demo videos as fallback
const demoVideos = bunnyVideos

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videos, setVideos] = useState(demoVideos)
  const [loading, setLoading] = useState(true)
  const [isLiveData, setIsLiveData] = useState(false)
  const { deviceType, isReady } = useDeviceType()

  useEffect(() => {
    // Only fetch videos once device type is ready
    if (isReady) {
      fetchVideos()
    }
  }, [deviceType, isReady])

  const fetchVideos = async () => {
    try {
      console.log('[Home] Fetching videos from Bunny CDN API...')
      
      // Fetch from our new API route with device type
      const response = await fetch(`/api/bunny-videos?device=${deviceType}`)
      const data = await response.json()
      
      if (data.success && data.videos && data.videos.length > 0) {
        console.log(`[Home] Successfully loaded ${data.videos.length} videos from Bunny CDN (${deviceType} library: ${data.libraryId})`)
        setVideos(data.videos)
        setIsLiveData(true)
      } else {
        console.log('[Home] No videos from API, using fallback videos')
        console.log('[Home] API response:', data)
        setIsLiveData(false)
        // Keep using demo videos as fallback
      }
    } catch (err) {
      console.error('[Home] Error fetching videos:', err)
      // Keep using demo videos when API fails
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (index: number, video: typeof videos[0]) => {
    setCurrentVideo(index)
    console.log('Now viewing:', video.username, '-', video.description)
    
    // Simple preload optimization - preload next video
    if (index + 1 < videos.length) {
      const nextVideo = videos[index + 1]
      if (nextVideo.src.includes('.m3u8')) {
        // For HLS videos, create a prefetch link
        const existingLink = document.querySelector(`link[href="${nextVideo.src}"]`)
        if (!existingLink) {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = nextVideo.src
          link.as = 'fetch'
          document.head.appendChild(link)
          
          // Remove after 30 seconds to prevent memory buildup
          setTimeout(() => {
            if (link.parentNode) {
              link.parentNode.removeChild(link)
            }
          }, 30000)
        }
      }
    }
  }

  if (!isReady || loading) {
    return (
      <div className="h-viewport w-full bg-black flex items-center justify-center">
        <div className="text-white">
          {!isReady ? 'Detecting device...' : 'Loading videos...'}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen w-full bg-white relative flex justify-center">
      {/* Video Scroller - Responsive width based on device type */}
      <div className={`h-full relative ${
        deviceType === 'desktop' 
          ? 'w-full' 
          : 'w-full sm:w-[430px]'
      }`}>
        <VideoScrollerFresh
          videos={videos}
          onVideoChange={handleVideoChange}
          deviceType={deviceType}
        />
      </div>
    </div>
  )
}
