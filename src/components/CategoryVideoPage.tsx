'use client'

import { useState, useEffect } from 'react'
import { VideoScrollerFresh } from '@/components/video/VideoScrollerFresh'
import { useDeviceType } from '@/hooks/useDeviceType'
import type { VendorCategory } from '@/config/categoryLibraries'

interface CategoryVideoPageProps {
  category: VendorCategory
  title: string
}

export function CategoryVideoPage({ category, title }: CategoryVideoPageProps) {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const { deviceType, isReady } = useDeviceType()

  useEffect(() => {
    // Reset hasFetched when category changes
    setHasFetched(false)
  }, [category])

  useEffect(() => {
    // Only fetch videos once device type is ready and we haven't fetched yet
    if (isReady && !hasFetched) {
      console.log(`[${title}] Ready to fetch - deviceType: ${deviceType}, isReady: ${isReady}`)
      fetchCategoryVideos()
      setHasFetched(true)
    }
  }, [isReady, hasFetched, deviceType, title])

  const fetchCategoryVideos = async () => {
    try {
      console.log(`[${title}] Fetching videos from category: ${category}`)
      console.log(`[${title}] Device type detected: ${deviceType}`)
      console.log(`[${title}] Window width: ${window.innerWidth}`)
      setLoading(true)
      setError(null)
      
      // Fetch from API with category and device type
      const url = `/api/bunny-videos?device=${deviceType}&category=${category}`
      console.log(`[${title}] Fetching from: ${url}`)
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`[${title}] API Response:`, {
        success: data.success,
        videoCount: data.videos?.length || 0,
        libraryId: data.libraryId,
        category: data.category,
        error: data.error
      })
      
      if (data.success && data.videos && data.videos.length > 0) {
        console.log(`[${title}] Successfully loaded ${data.videos.length} videos from ${category} library (${deviceType})`)
        console.log(`[${title}] First video category check:`, data.videos[0].category)
        console.log(`[${title}] All video categories:`, data.videos.map(v => v.category))
        setVideos(data.videos)
      } else if (data.videos && data.videos.length === 0) {
        setError('No videos available in this category yet')
        console.log(`[${title}] No videos found in ${category} library`)
      } else {
        setError(data.error || 'Failed to load videos')
        console.error(`[${title}] API error:`, data)
      }
    } catch (err) {
      console.error(`[${title}] Error fetching videos:`, err)
      setError('Network error - please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (index: number, video: any) => {
    setCurrentVideo(index)
    console.log(`[${title}] Now viewing:`, video.username, '-', video.description)
    
    // Preload next video
    if (index + 1 < videos.length) {
      const nextVideo = videos[index + 1]
      if (nextVideo.src.includes('.m3u8')) {
        const existingLink = document.querySelector(`link[href="${nextVideo.src}"]`)
        if (!existingLink) {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = nextVideo.src
          link.as = 'fetch'
          document.head.appendChild(link)
          
          // Remove after 30 seconds
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <div className="text-white">
            {!isReady ? 'Detecting device...' : 'Loading videos...'}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-viewport w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchCategoryVideos}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="h-viewport w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
          <p className="text-gray-400">No videos available yet</p>
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