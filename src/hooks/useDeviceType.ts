import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'desktop' | 'tablet'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile')

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      
      // Check if it's a touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Determine device type based on screen width and touch capability
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width >= 768 && width < 1024 && isTouchDevice) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Initial check
    checkDevice()

    // Listen for resize events
    window.addEventListener('resize', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  return deviceType
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