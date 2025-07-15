'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { 
  useIsTouchDevice, 
  useIsPortrait, 
  useIsHighDensity,
  usePrefersReducedMotion 
} from '@/hooks/useMediaQuery'

interface DeviceInfo {
  // Device type
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Features
  isTouch: boolean
  isPortrait: boolean
  isHighDensity: boolean
  prefersReducedMotion: boolean
  
  // Platform detection (client-side only)
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  
  // Capabilities
  supportsHover: boolean
  supportsTouchEvents: boolean
  supportsPointerEvents: boolean
}

const DeviceContext = createContext<DeviceInfo | undefined>(undefined)

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()
  const isTouch = useIsTouchDevice()
  const isPortrait = useIsPortrait()
  const isHighDensity = useIsHighDensity()
  const prefersReducedMotion = usePrefersReducedMotion()

  const deviceInfo = useMemo<DeviceInfo>(() => {
    // Safe client-side only checks
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    
    return {
      // Device type
      isMobile,
      isTablet,
      isDesktop,
      
      // Features
      isTouch,
      isPortrait,
      isHighDensity,
      prefersReducedMotion,
      
      // Platform detection
      isIOS: /iPhone|iPad|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isChrome: /Chrome/.test(userAgent),
      
      // Capabilities
      supportsHover: !isTouch,
      supportsTouchEvents: typeof window !== 'undefined' && 'ontouchstart' in window,
      supportsPointerEvents: typeof window !== 'undefined' && 'PointerEvent' in window,
    }
  }, [isMobile, isTablet, isDesktop, isTouch, isPortrait, isHighDensity, prefersReducedMotion])

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevice() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider')
  }
  return context
}