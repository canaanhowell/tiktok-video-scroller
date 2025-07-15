'use client'

import { VideoScroller } from '@/components/video/VideoScroller'

export default function DemoPage() {
  // Your actual uploaded videos from Bunny CDN
  const bunnyVideos = [
    {
      id: '724695ee-95f8-4a97-8558-ec4d384613e3',
      src: 'https://vz-97606b97-31d.b-cdn.net/724695ee-95f8-4a97-8558-ec4d384613e3/playlist.m3u8',
      username: 'user_1',
      description: 'TikTok Video 1 - Uploaded from input folder',
      likes: 1234,
      comments: 56,
      shares: 12,
    },
    {
      id: '73057fa4-bc39-492c-a69f-814503efa047',
      src: 'https://vz-97606b97-31d.b-cdn.net/73057fa4-bc39-492c-a69f-814503efa047/playlist.m3u8',
      username: 'user_2',
      description: 'TikTok Video 2 - Uploaded from input folder',
      likes: 5678,
      comments: 234,
      shares: 89,
    },
    {
      id: '0c186e2d-1c2b-44bc-a37b-f1b40db2ef35',
      src: 'https://vz-97606b97-31d.b-cdn.net/0c186e2d-1c2b-44bc-a37b-f1b40db2ef35/playlist.m3u8',
      username: 'user_4',
      description: 'TikTok Video 4 - Uploaded from input folder',
      likes: 9012,
      comments: 345,
      shares: 123,
    },
    {
      id: '72118581-c1e7-4e79-8e10-f47c95531b05',
      src: 'https://vz-97606b97-31d.b-cdn.net/72118581-c1e7-4e79-8e10-f47c95531b05/playlist.m3u8',
      username: 'user_5',
      description: 'TikTok Video 5 - Uploaded from input folder',
      likes: 3456,
      comments: 123,
      shares: 45,
    },
  ]

  return (
    <div className="h-viewport w-full bg-black relative">
      <VideoScroller videos={bunnyVideos} />
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-black/80 backdrop-blur rounded-lg px-4 py-3 max-w-sm">
          <h2 className="text-white font-semibold mb-2">Demo: Your Bunny CDN Videos</h2>
          <p className="text-white/80 text-sm">
            These are your actual videos uploaded from the input folder, 
            served directly from Bunny CDN.
          </p>
        </div>
      </div>
    </div>
  )
}