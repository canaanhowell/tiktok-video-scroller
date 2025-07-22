'use client'

import { useState, useEffect } from 'react'
import { useDeviceType } from '@/hooks/useDeviceType'

export default function MobileDebugPage() {
  const { deviceType, isReady } = useDeviceType()
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isReady) {
      fetchVideos()
    }
  }, [isReady, deviceType])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bunny-videos?device=${deviceType}&category=default`)
      const data = await response.json()
      setApiResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Get detailed device info
  const deviceInfo = {
    deviceType,
    isReady,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 'N/A',
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 'N/A',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    touchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 'N/A',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'N/A',
    isTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Mobile Debug</h1>
      
      <div className="space-y-4">
        <section className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Device Detection</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(deviceInfo, null, 2)}
          </pre>
        </section>

        <section className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">API Response</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {apiResponse && (
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                success: apiResponse.success,
                libraryId: apiResponse.libraryId,
                category: apiResponse.category,
                videoCount: apiResponse.videos?.length || 0,
                error: apiResponse.error,
                firstVideo: apiResponse.videos?.[0] ? {
                  id: apiResponse.videos[0].id,
                  title: apiResponse.videos[0].title,
                  category: apiResponse.videos[0].category,
                  vendor: apiResponse.videos[0].vendorName
                } : null
              }, null, 2)}
            </pre>
          )}
        </section>

        <section className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Test Video Player</h2>
          {apiResponse?.videos?.[0] && (
            <div className="bg-gray-900 rounded overflow-hidden">
              <video
                src={apiResponse.videos[0].src}
                controls
                className="w-full"
                playsInline
              />
              <p className="p-2 text-xs">
                Test video: {apiResponse.videos[0].title}
              </p>
            </div>
          )}
        </section>

        <section className="border border-gray-700 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Reload Page
          </button>
          <button
            onClick={fetchVideos}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Refetch Videos
          </button>
        </section>
      </div>
    </div>
  )
}