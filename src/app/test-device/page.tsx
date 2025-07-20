'use client'

import { useDeviceType } from '@/hooks/useDeviceType'
import { useState, useEffect } from 'react'

export default function TestDevicePage() {
  const deviceType = useDeviceType()
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = async (device: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/bunny-videos?device=${device}`)
      const data = await response.json()
      
      if (data.success) {
        setVideos(data.videos)
      } else {
        setError(data.error || 'Failed to fetch videos')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(deviceType)
  }, [deviceType])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Device Detection Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-lg">Current Device Type: <strong className="text-blue-600">{deviceType}</strong></p>
        <p className="text-sm text-gray-600 mt-2">
          Resize your browser window to see the device type change
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manual Test</h2>
        <div className="flex gap-4">
          <button
            onClick={() => fetchVideos('mobile')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fetch Mobile Videos (9x16)
          </button>
          <button
            onClick={() => fetchVideos('desktop')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Fetch Desktop Videos (16x9)
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-6">Loading videos...</div>
      )}

      {error && (
        <div className="mt-6 text-red-600">Error: {error}</div>
      )}

      {!loading && videos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Loaded {videos.length} videos from library: {videos[0]?.src?.includes('469922') ? '469922 (16x9)' : '467029 (9x16)'}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {videos.slice(0, 5).map((video, index) => (
              <div key={video.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{index + 1}. {video.title || video.description}</p>
                <p className="text-sm text-gray-600 truncate">{video.src}</p>
              </div>
            ))}
            {videos.length > 5 && (
              <p className="text-sm text-gray-500">...and {videos.length - 5} more videos</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}