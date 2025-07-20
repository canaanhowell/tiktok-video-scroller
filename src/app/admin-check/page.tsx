'use client'

import { useState, useEffect } from 'react'

export default function AdminCheckPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkLibraries()
  }, [])

  const checkLibraries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/check-libraries-admin')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check libraries')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Checking Bunny CDN Libraries...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <div className="text-red-500">{error}</div>
        <button 
          onClick={checkLibraries}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Bunny CDN Library Check</h1>
      
      {data?.summary && (
        <div className="mb-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-gray-400">Total Libraries</div>
              <div className="text-2xl">{data.summary.totalLibraries}</div>
            </div>
            <div>
              <div className="text-gray-400">Checked</div>
              <div className="text-2xl">{data.summary.librariesChecked}</div>
            </div>
            <div>
              <div className="text-gray-400">With Videos</div>
              <div className="text-2xl text-green-500">{data.summary.librariesWithVideos}</div>
            </div>
            <div>
              <div className="text-gray-400">Empty</div>
              <div className="text-2xl text-yellow-500">{data.summary.emptyLibraries}</div>
            </div>
            <div>
              <div className="text-gray-400">Failed</div>
              <div className="text-2xl text-red-500">{data.summary.failedChecks}</div>
            </div>
          </div>
        </div>
      )}

      {data?.categorySummary && (
        <div className="space-y-6">
          {Object.entries(data.categorySummary).map(([category, devices]: [string, any]) => (
            <div key={category} className="bg-gray-800 rounded p-4">
              <h3 className="text-xl font-semibold mb-3 capitalize">{category}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(devices).map(([device, info]: [string, any]) => (
                  <div key={device} className="bg-gray-700 rounded p-3">
                    <h4 className="font-medium mb-2 flex items-center justify-between">
                      <span className="capitalize">{device}</span>
                      <span className="text-xs text-gray-400">ID: {info.libraryId}</span>
                    </h4>
                    {info.status === 'success' ? (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Total Videos: {info.totalVideos}</span>
                          <span className="text-green-500">Ready: {info.readyVideos}</span>
                        </div>
                        {info.totalVideos === 0 && (
                          <div className="text-yellow-500 text-sm">⚠️ No videos in this library</div>
                        )}
                        {info.videos && info.videos.length > 0 && (
                          <div className="mt-2 text-xs text-gray-400">
                            <div className="font-medium mb-1">Sample videos:</div>
                            {info.videos.map((v: any, i: number) => (
                              <div key={i} className="truncate">
                                • {v.title || 'Untitled'} ({v.statusText})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-500">
                        Error: {info.statusCode} {info.statusText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        Admin Key: {data?.adminKey}
      </div>
    </div>
  )
}