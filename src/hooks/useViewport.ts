'use client'

import { useState, useEffect } from 'react'

export interface ViewportSize {
  width: number
  height: number
}

export function useViewport(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add resize listener
    window.addEventListener('resize', handleResize)
    
    // Initial call
    handleResize()

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}