'use client'

import { useState, useEffect } from 'react'
import { useViewport } from './useViewport'

// Breakpoint definitions matching Tailwind config
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const

export type Breakpoint = keyof typeof breakpoints

export function useBreakpoint() {
  const { width } = useViewport()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs')

  useEffect(() => {
    // Determine current breakpoint
    let breakpoint: Breakpoint = 'xs'
    
    if (width >= breakpoints['3xl']) {
      breakpoint = '3xl'
    } else if (width >= breakpoints['2xl']) {
      breakpoint = '2xl'
    } else if (width >= breakpoints.xl) {
      breakpoint = 'xl'
    } else if (width >= breakpoints.lg) {
      breakpoint = 'lg'
    } else if (width >= breakpoints.md) {
      breakpoint = 'md'
    } else if (width >= breakpoints.sm) {
      breakpoint = 'sm'
    }

    setCurrentBreakpoint(breakpoint)
  }, [width])

  // Helper functions
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
  const isTablet = currentBreakpoint === 'md' || currentBreakpoint === 'lg'
  const isDesktop = currentBreakpoint === 'xl' || currentBreakpoint === '2xl' || currentBreakpoint === '3xl'
  
  const isAbove = (breakpoint: Breakpoint) => width >= breakpoints[breakpoint]
  const isBelow = (breakpoint: Breakpoint) => width < breakpoints[breakpoint]
  const isBetween = (min: Breakpoint, max: Breakpoint) => 
    width >= breakpoints[min] && width < breakpoints[max]

  return {
    breakpoint: currentBreakpoint,
    width,
    isMobile,
    isTablet,
    isDesktop,
    isAbove,
    isBelow,
    isBetween,
  }
}