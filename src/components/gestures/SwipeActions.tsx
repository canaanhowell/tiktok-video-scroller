'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, UserPlus, Share2, Bookmark } from 'lucide-react'

interface SwipeActionsProps {
  onFollow?: () => void
  onShare?: () => void
  onSave?: () => void
  username: string
}

export function SwipeActions({ onFollow, onShare, onSave, username }: SwipeActionsProps) {
  const [showActions, setShowActions] = useState<'left' | 'right' | null>(null)

  return (
    <>
      {/* Left swipe indicator - Follow */}
      <AnimatePresence>
        {showActions === 'left' && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="bg-blue-500 rounded-full p-4 shadow-lg">
              <UserPlus size={24} className="text-white" />
              <p className="text-white text-sm mt-2">Follow {username}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right swipe indicator - Share/Save */}
      <AnimatePresence>
        {showActions === 'right' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="flex flex-col gap-4">
              <button
                onClick={onShare}
                className="bg-green-500 rounded-full p-4 shadow-lg"
              >
                <Share2 size={24} className="text-white" />
              </button>
              <button
                onClick={onSave}
                className="bg-purple-500 rounded-full p-4 shadow-lg"
              >
                <Bookmark size={24} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function useSwipeActions() {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  
  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction)
    setTimeout(() => setSwipeDirection(null), 2000)
  }

  return {
    swipeDirection,
    handleSwipe
  }
}