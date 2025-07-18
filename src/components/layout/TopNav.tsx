'use client'

import { Search, LogIn } from 'lucide-react'
import Link from 'next/link'
import { colors, colorClasses } from '@/config/colors'
import { cn } from '@/lib/utils'

export function TopNav() {
  return (
    <div className={cn("hidden md:flex fixed top-0 left-64 right-0 h-16 z-50", colorClasses.bgPrimary)}>
      <div className="w-full h-full relative">
        {/* Search Bar - Centered in the available space */}
        <div className="absolute left-0 right-0 flex justify-center top-1/2 -translate-y-1/2">
          <div className="w-[430px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts and videos"
                className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* Login Button - Right side, 20px from edge */}
        <Link
          href="/login"
          className={cn("flex items-center gap-2 px-4 py-2 rounded-md transition absolute right-5 top-1/2 -translate-y-1/2", colorClasses.bgAccent, colorClasses.textPrimary, colorClasses.hoverAccent)}
        >
          <LogIn className="w-4 h-4" />
          <span className="font-medium">Login</span>
        </Link>
      </div>
    </div>
  )
}