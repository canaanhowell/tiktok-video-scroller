'use client'

import { useState, useEffect } from 'react'

export default function TestPhotographersPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testPhotographersAPI()
  }, [])

  const testPhotographersAPI = async () => {
    try {
      // Test desktop
      console.log('Testing photographers desktop API...')
      const desktopResponse = await fetch('/api/bunny-videos?device=desktop&category=photographers')
      const desktopData = await desktopResponse.json()
      
      // Test mobile
      console.log('Testing photographers mobile API...')
      const mobileResponse = await fetch('/api/bunny-videos?device=mobile&category=photographers')
      const mobileData = await mobileResponse.json()
      
      setData({
        desktop: desktopData,
        mobile: mobileData
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test API')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Photographers API Test</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl mb-2">Desktop (16:9)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data?.desktop, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl mb-2">Mobile (9:16)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data?.mobile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}