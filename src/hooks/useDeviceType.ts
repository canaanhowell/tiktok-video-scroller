import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'desktop' | 'tablet'

export interface UseDeviceTypeResult {
  deviceType: DeviceType
  isReady: boolean
}

// Helper function to determine device type
function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop' // Default for SSR - assume desktop to avoid mobile library on desktop
  }
  
  const width = window.innerWidth
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Log for debugging
  console.log('[useDeviceType] Initial detection - width:', width, 'touch:', isTouchDevice)
  
  if (width < 768) {
    return 'mobile'
  } else if (width >= 768 && width < 1024 && isTouchDevice) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

export function useDeviceType(): UseDeviceTypeResult {
  // Initialize with actual device type immediately
  const [deviceType, setDeviceType] = useState<DeviceType>(() => getDeviceType())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Mark as ready after initial render
    setIsReady(true)
    
    const checkDevice = () => {
      const newDeviceType = getDeviceType()
      setDeviceType(newDeviceType)
    }

    // Double-check on mount in case SSR/hydration mismatch
    checkDevice()

    // Listen for resize events
    window.addEventListener('resize', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  return { deviceType, isReady }
}

// For server-side rendering, we can also check user agent
export function getDeviceTypeFromUserAgent(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase()
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile'
  } else if (/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)) {
    return 'tablet'
  }
  
  return 'desktop'
}