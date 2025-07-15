'use client'

import { useState, useEffect } from 'react'
import { VideoScroller } from '@/components/video/VideoScroller'
import { Typography } from '@/components/ui/Typography'

// Your actual Bunny CDN videos
const bunnyVideos = [
  {
    id: '724695ee-95f8-4a97-8558-ec4d384613e3',
    src: 'https://vz-97606b97-31d.b-cdn.net/724695ee-95f8-4a97-8558-ec4d384613e3/playlist.m3u8',
    username: 'user_1',
    description: 'Video 1 from input folder 🎥',
    likes: 1234,
    comments: 56,
    shares: 12,
  },
  {
    id: '73057fa4-bc39-492c-a69f-814503efa047',
    src: 'https://vz-97606b97-31d.b-cdn.net/73057fa4-bc39-492c-a69f-814503efa047/playlist.m3u8',
    username: 'user_2',
    description: 'Video 2 from input folder 🎬',
    likes: 5678,
    comments: 234,
    shares: 89,
  },
  {
    id: '0c186e2d-1c2b-44bc-a37b-f1b40db2ef35',
    src: 'https://vz-97606b97-31d.b-cdn.net/0c186e2d-1c2b-44bc-a37b-f1b40db2ef35/playlist.m3u8',
    username: 'user_4',
    description: 'Video 4 from input folder 📹',
    likes: 9012,
    comments: 345,
    shares: 123,
  },
  {
    id: '72118581-c1e7-4e79-8e10-f47c95531b05',
    src: 'https://vz-97606b97-31d.b-cdn.net/72118581-c1e7-4e79-8e10-f47c95531b05/playlist.m3u8',
    username: 'user_5',
    description: 'Video 5 from input folder 🎞️',
    likes: 3456,
    comments: 123,
    shares: 45,
  },
]

// Demo videos as fallback
const demoVideos = bunnyVideos

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videos, setVideos] = useState(demoVideos)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Temporarily disabled API fetch - using hardcoded Bunny videos
    // fetchVideos()
    setLoading(false)
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
