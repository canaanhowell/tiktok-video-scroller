'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function MobileCropDemo() {
  const [isMobile, setIsMobile] = useState(false)
  
  const aspectRatios = [
    { name: '9:16 (TikTok)', width: 9, height: 16, color: 'bg-green-500' },
    { name: '16:9 (YouTube)', width: 16, height: 9, color: 'bg-blue-500' },
    { name: '1:1 (Square)', width: 1, height: 1, color: 'bg-purple-500' },
    { name: '4:3 (TV)', width: 4, height: 3, color: 'bg-orange-500' },
  ]
  
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">Mobile Auto Crop/Zoom Demo</h1>
      
      <button
        onClick={() => setIsMobile(!isMobile)}
        className="mb-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Toggle Mobile View: {isMobile ? 'ON' : 'OFF'}
      </button>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {aspectRatios.map((ratio) => (
          <div key={ratio.name} className="text-white">
            <h3 className="text-sm mb-2">{ratio.name}</h3>
            <div className="relative bg-black" style={{ paddingBottom: '177.78%' /* 16:9 */ }}>
              <div className="absolute inset-0 border border-gray-600">
                <div 
                  className={cn(
                    "absolute inset-0 flex items-center justify-center text-black font-bold",
                    ratio.color,
                    isMobile ? "object-cover-demo" : "object-contain-demo"
                  )}
                  style={{
                    aspectRatio: `${ratio.width}/${ratio.height}`,
                    maxWidth: isMobile ? '100%' : `calc(100% * 9 / 16)`,
                    maxHeight: '100%',
                    width: isMobile ? '100%' : 'auto',
                    height: isMobile ? '100%' : 'auto',
                    margin: 'auto',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    objectFit: isMobile ? 'cover' : 'contain'
                  }}
                >
                  {ratio.width}:{ratio.height}
                </div>
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-400">
              {isMobile ? 'Cropped to fill' : 'Original ratio'}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-white">
        <h2 className="text-lg font-bold mb-2">How it works:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Desktop: Videos maintain their original aspect ratio with borders</li>
          <li>Mobile: Videos auto-crop/zoom to fill 9:16 screen (object-fit: cover)</li>
          <li>16:9 videos zoom 3.16x and crop sides</li>
          <li>Square videos zoom 1.78x and crop sides</li>
          <li>9:16 videos display perfectly without modification</li>
        </ul>
      </div>
    </div>
  )
}