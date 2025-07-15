'use client'

import { useRef, useCallback } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  onClick?: () => void
  threshold?: number
}

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500
}: UseLongPressOptions) {
  const isLongPressRef = useRef(false)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handlePressStart = useCallback(() => {
    isLongPressRef.current = false
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      onLongPress()
    }, threshold)
  }, [onLongPress, threshold])

  const handlePressEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }

    if (!isLongPressRef.current && onClick) {
      onClick()
    }
  }, [onClick])

  const handlePressCancel = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }, [])

  return {
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressCancel,
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressCancel,
  }
}