'use client'

import { useState, useEffect } from 'react'
import { VideoScrollerFresh } from '@/components/video/VideoScrollerFresh'
import { Typography } from '@/components/ui/Typography'
import { videoService } from '@/services/videos'

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

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      // Use video service layer instead of direct API calls
      console.log('Fetching videos via service layer...')
      const fetchedVideos = await videoService.getVideoFeed('current-user', { limit: 20 })
      
      if (fetchedVideos && fetchedVideos.length > 0) {
        console.log('Using videos from service layer:', fetchedVideos.length)
        setVideos(fetchedVideos)
      } else {
        console.log('No videos from service layer, using demo videos')
        // Keep using demo videos as fallback
      }
    } catch (err) {
      console.log('Service layer not implemented yet, using demo videos')
      console.log('Error:', err instanceof Error ? err.message : 'Unknown error')
      // Keep using demo videos when service is not implemented
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

  if (loading) {
    return (
      <div className="h-viewport w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="h-screen md:h-screen h-[calc(100vh-64px)] w-full bg-black relative flex justify-center">
      {/* Video Scroller - Fixed width on larger screens */}
      <div className="w-full sm:w-[430px] h-full relative">
        <VideoScrollerFresh
          videos={videos}
          onVideoChange={handleVideoChange}
        />
        
        {/* Development overlay */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-2">
            <Typography variant="caption" className="text-white/80">
              Video {currentVideo + 1} of {videos.length}
              {videos === demoVideos && ' (Demo)'}
            </Typography>
          </div>
        </div>

        {/* Scroll hint - only on desktop, positioned below video */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none items-center gap-1 text-white/70 animate-pulse">
          <span className="text-sm font-medium">scroll</span>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
