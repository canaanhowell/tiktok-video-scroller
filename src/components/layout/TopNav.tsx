'use client'

import { Search, Upload, User } from 'lucide-react'
import Link from 'next/link'

export function TopNav() {
  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-6 h-full">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white">
          TikTok
        </Link>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts and videos"
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-white/50" />
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/upload"
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition"
          >
            <Upload className="w-4 h-4" />
            <span className="font-medium">Upload</span>
          </Link>
          
          <Link
            href="/profile"
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
          >
            <User className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  )
}