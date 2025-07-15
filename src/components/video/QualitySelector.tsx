'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/Typography'
import type { Level } from 'hls.js'

interface QualitySelectorProps {
  levels: Level[]
  currentLevel: number
  onLevelChange: (level: number) => void
  className?: string
}

export function QualitySelector({
  levels,
  currentLevel,
  onLevelChange,
  className,
}: QualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get quality label
  const getQualityLabel = (level: Level) => {
    const height = level.height
    if (height >= 2160) return '4K'
    if (height >= 1440) return '1440p'
    if (height >= 1080) return '1080p HD'
    if (height >= 720) return '720p HD'
    if (height >= 480) return '480p'
    if (height >= 360) return '360p'
    return `${height}p`
  }

  // Get bitrate label
  const getBitrateLabel = (bitrate: number) => {
    const mbps = (bitrate / 1000000).toFixed(1)
    return `${mbps} Mbps`
  }

  // Current quality label
  const currentQuality = currentLevel === -1 
    ? 'Auto' 
    : levels[currentLevel] 
      ? getQualityLabel(levels[currentLevel])
      : 'Unknown'

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (levels.length === 0) return null

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      {/* Quality button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target flex items-center justify-center px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Video quality"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 14.52l-2.83-2.83c-.61-.61-1.09-.99-1.69-.99-.6 0-1.08.38-1.69.99l-2.83 2.83c-.39.39-.39 1.02 0 1.41l2.83 2.83c.61.61 1.09.99 1.69.99.6 0 1.08-.38 1.69-.99l2.83-2.83c.39-.39.39-1.02 0-1.41zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
        </svg>
        <Typography variant="caption" className="text-white">
          {currentQuality}
        </Typography>
      </button>

      {/* Quality menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden min-w-[180px]">
          {/* Auto option */}
          <button
            onClick={() => {
              onLevelChange(-1)
              setIsOpen(false)
            }}
            className={cn(
              'w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors',
              currentLevel === -1 && 'bg-white/20'
            )}
          >
            <Typography variant="caption" className="text-white">
              Auto
            </Typography>
            {currentLevel === -1 && (
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </button>

          <div className="h-px bg-white/20" />

          {/* Quality levels */}
          {levels
            .slice()
            .sort((a, b) => b.height - a.height)
            .map((level, index) => {
              const levelIndex = levels.indexOf(level)
              return (
                <button
                  key={levelIndex}
                  onClick={() => {
                    onLevelChange(levelIndex)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors',
                    currentLevel === levelIndex && 'bg-white/20'
                  )}
                >
                  <div className="flex flex-col items-start">
                    <Typography variant="caption" className="text-white">
                      {getQualityLabel(level)}
                    </Typography>
                    <Typography variant="caption" className="text-white/60 text-xs">
                      {getBitrateLabel(level.bitrate)}
                    </Typography>
                  </div>
                  {currentLevel === levelIndex && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}

// Mobile quality selector with bottom sheet
export function MobileQualitySelector({
  levels,
  currentLevel,
  onLevelChange,
  isOpen,
  onClose,
}: QualitySelectorProps & {
  isOpen: boolean
  onClose: () => void
}) {
  const getQualityLabel = (level: Level) => {
    const height = level.height
    if (height >= 2160) return '4K Ultra HD'
    if (height >= 1440) return '1440p Quad HD'
    if (height >= 1080) return '1080p Full HD'
    if (height >= 720) return '720p HD'
    if (height >= 480) return '480p'
    if (height >= 360) return '360p'
    return `${height}p`
  }

  const getBitrateLabel = (bitrate: number) => {
    const mbps = (bitrate / 1000000).toFixed(1)
    return `${mbps} Mbps`
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl z-50 safe-bottom">
        <div className="px-4 py-3 border-b border-white/10">
          <Typography variant="h6" className="text-white text-center">
            Video Quality
          </Typography>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {/* Auto option */}
          <button
            onClick={() => {
              onLevelChange(-1)
              onClose()
            }}
            className={cn(
              'w-full px-4 py-4 flex items-center justify-between',
              currentLevel === -1 && 'bg-white/10'
            )}
          >
            <div className="flex flex-col items-start">
              <Typography variant="body" className="text-white">
                Auto
              </Typography>
              <Typography variant="caption" className="text-white/60">
                Adjusts to your connection speed
              </Typography>
            </div>
            {currentLevel === -1 && (
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </button>

          {/* Quality levels */}
          {levels
            .slice()
            .sort((a, b) => b.height - a.height)
            .map((level) => {
              const levelIndex = levels.indexOf(level)
              return (
                <button
                  key={levelIndex}
                  onClick={() => {
                    onLevelChange(levelIndex)
                    onClose()
                  }}
                  className={cn(
                    'w-full px-4 py-4 flex items-center justify-between',
                    currentLevel === levelIndex && 'bg-white/10'
                  )}
                >
                  <div className="flex flex-col items-start">
                    <Typography variant="body" className="text-white">
                      {getQualityLabel(level)}
                    </Typography>
                    <Typography variant="caption" className="text-white/60">
                      {getBitrateLabel(level.bitrate)}
                    </Typography>
                  </div>
                  {currentLevel === levelIndex && (
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              )
            })}
        </div>
      </div>
    </>
  )
}