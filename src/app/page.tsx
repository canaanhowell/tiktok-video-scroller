'use client'

import { useState, useEffect } from 'react'
import { VideoScroller } from '@/components/video/VideoScrollerSimple'
import { Typography } from '@/components/ui/Typography'

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
    <div className="h-[calc(100vh-64px)] md:h-viewport w-full bg-black relative">
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
    </div>
  )
}
