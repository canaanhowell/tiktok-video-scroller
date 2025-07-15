'use client'

import { useState } from 'react'
import { VideoScroller } from '@/components/video/VideoScroller'
import { Typography } from '@/components/ui/Typography'

// Demo videos - replace with your actual video data from Supabase
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
  {
    id: '4',
    src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    username: 'demo_user4',
    description: 'Art in motion 🎨 #creative #inspiration',
    likes: 3456,
    comments: 123,
    shares: 45,
  },
  {
    id: '5',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    username: 'demo_user5',
    description: 'Never stop exploring 🌍 #travel #adventure',
    likes: 7890,
    comments: 456,
    shares: 234,
  },
]

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0)

  const handleVideoChange = (index: number, video: typeof demoVideos[0]) => {
    setCurrentVideo(index)
    console.log('Now viewing:', video.username, '-', video.description)
  }

  return (
    <div className="h-viewport w-full bg-black relative">
      {/* Video Scroller */}
      <VideoScroller
        videos={demoVideos}
        onVideoChange={handleVideoChange}
      />
      
      {/* Development overlay */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-2">
          <Typography variant="caption" className="text-white/80">
            Video {currentVideo + 1} of {demoVideos.length}
          </Typography>
        </div>
      </div>
      
      {/* Mobile bottom padding for nav */}
      <div className="h-16 md:hidden pointer-events-none" />
    </div>
  )
}
