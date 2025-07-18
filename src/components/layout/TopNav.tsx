'use client'

import { Search, LogIn } from 'lucide-react'
import Link from 'next/link'

export function TopNav() {
  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50">
      <div className="w-full h-full relative">
        {/* Logo - Left side */}
        <Link href="/" className="text-2xl font-bold text-white absolute left-6 top-1/2 -translate-y-1/2">
          TikTok
        </Link>
        
        {/* Search Bar - Positioned to align exactly with video stream */}
        {/* Video is centered in main content which starts at ml-64 (256px) */}
        <div className="absolute left-64 right-0 flex justify-center top-1/2 -translate-y-1/2">
          <div className="w-[430px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts and videos"
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-white/50" />
            </div>
          </div>
        </div>
        
        {/* Login Button - Right side, 20px from edge */}
        <Link
          href="/login"
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition absolute right-5 top-1/2 -translate-y-1/2"
        >
          <LogIn className="w-4 h-4" />
          <span className="font-medium">Login</span>
        </Link>
      </div>
    </div>
  )
}