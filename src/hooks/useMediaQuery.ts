'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener (using addEventListener for modern browsers)
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

// Preset media queries
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1536px)')
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)')
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)')
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)')
export const useIsHighDensity = () => useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)')
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')