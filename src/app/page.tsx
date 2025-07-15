'use client'

import { useState, useEffect } from 'react'
import { VideoScroller } from '@/components/video/VideoScroller'
import { Typography } from '@/components/ui/Typography'

// Demo videos as fallback
const demoVideos = [
  {
    id: '1',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    username: 'demo_user1',
    description: 'Beautiful nature scenery 🌲 #nature #relaxing',
    likes: 1234,
    comments: 56,
    shares: 12,
  },
  {
    id: '2',
    src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    username: 'demo_user2',
    description: 'Check out this amazing animation! 🎬 #animation #film',
    likes: 5678,
    comments: 234,
    shares: 89,
  },
  {
    id: '3',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    username: 'demo_user3',
    description: 'Living my best life 😎 #lifestyle #vibes',
    likes: 9012,
    comments: 345,
    shares: 123,
  },
]

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videos, setVideos] = useState(demoVideos)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos/list?limit=20')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched videos from Bunny CDN:', data.videos.length)
        
        // Filter only ready videos (status 4 means fully processed)
        const readyVideos = data.videos.filter((video: any) => {
          // Status 4 = finished processing, Status 3 = encoding
          return video.status === 4 || video.status === 3
        })
        
        if (readyVideos.length > 0) {
          console.log('Using Bunny CDN videos:', readyVideos)
          setVideos(readyVideos)
        } else {
          console.log('No ready videos from Bunny CDN yet, using demo videos')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch videos:', errorData)
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
      // Keep using demo videos on error
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (index: number, video: typeof videos[0]) => {
    setCurrentVideo(index)
    console.log('Now viewing:', video.username, '-', video.description)
  }

  if (loading) {
    return (
      <div className="h-viewport w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="h-viewport w-full bg-black relative">
      {/* Video Scroller */}
      <VideoScroller
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
      
      {/* Mobile bottom padding for nav */}
      <div className="h-16 md:hidden pointer-events-none" />
    </div>
  )
}
