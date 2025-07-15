'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Flag, Download, Copy, MoreHorizontal } from 'lucide-react'

interface OptionsMenuProps {
  isOpen: boolean
  onClose: () => void
  onShare?: () => void
  onReport?: () => void
  onDownload?: () => void
  onCopyLink?: () => void
  position?: { x: number; y: number }
}

export function OptionsMenu({
  isOpen,
  onClose,
  onShare,
  onReport,
  onDownload,
  onCopyLink,
  position = { x: 50, y: 50 }
}: OptionsMenuProps) {
  const menuItems = [
    { icon: Share2, label: 'Share', onClick: onShare },
    { icon: Copy, label: 'Copy Link', onClick: onCopyLink },
    { icon: Download, label: 'Download', onClick: onDownload },
    { icon: Flag, label: 'Report', onClick: onReport },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="p-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick?.()
                      onClose()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Icon size={20} className="text-gray-400" />
                    <span className="text-white text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}