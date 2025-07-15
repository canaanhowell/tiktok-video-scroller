'use client'

import { useRef, useCallback } from 'react'

interface UseDoubleTapOptions {
  onSingleTap?: () => void
  onDoubleTap?: () => void
  delay?: number
}

export function useDoubleTap({
  onSingleTap,
  onDoubleTap,
  delay = 300
}: UseDoubleTapOptions) {
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTapRef = useRef<number>(0)

  const handleTap = useCallback(() => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
        tapTimeoutRef.current = null
      }
      onDoubleTap?.()
      lastTapRef.current = 0
    } else {
      // Single tap
      lastTapRef.current = now
      tapTimeoutRef.current = setTimeout(() => {
        onSingleTap?.()
        lastTapRef.current = 0
      }, delay)
    }
  }, [delay, onSingleTap, onDoubleTap])

  return handleTap
}