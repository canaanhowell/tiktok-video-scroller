'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LikeAnimationProps {
  trigger: number // Increment this to trigger animation
}

export function LikeAnimation({ trigger }: LikeAnimationProps) {
  const [hearts, setHearts] = useState<number[]>([])

  useEffect(() => {
    if (trigger > 0) {
      const newHeart = Date.now()
      setHearts(prev => [...prev, newHeart])
      
      // Remove heart after animation completes
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h !== newHeart))
      }, 1000)
    }
  }, [trigger])

  return (
    <AnimatePresence>
      {hearts.map((heartId) => (
        <motion.div
          key={heartId}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 2],
            y: [0, -100]
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="text-red-500 text-8xl">❤️</div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}