'use client'

import { useRef, useState } from 'react'
import { usePinch } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'

export function usePinchZoom() {
  const [zoom, setZoom] = useState(1)
  const pinchRef = useRef<HTMLDivElement>(null)

  const [style, api] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
  }))

  const bind = usePinch(
    ({ origin, offset: [scale], active, movement: [mx, my] }) => {
      api.start({
        scale: active ? scale : 1,
        x: active ? mx : 0,
        y: active ? my : 0,
        immediate: (key) => key !== 'scale' && active,
      })
      
      if (!active) {
        setZoom(1)
      } else {
        setZoom(scale)
      }
    },
    {
      scaleBounds: { min: 1, max: 3 },
      rubberband: true,
      from: () => [zoom, 0] as [number, number],
    }
  )

  return {
    bind,
    style,
    zoom,
    ref: pinchRef,
    animated,
  }
}