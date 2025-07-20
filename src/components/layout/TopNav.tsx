'use client'

import { Search, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { colors, colorClasses } from '@/config/colors'
import { cn } from '@/lib/utils'

export function TopNav() {
  return (
    <div className={cn("hidden md:flex fixed top-0 left-64 right-0 h-16 z-50", colorClasses.bgPrimary)}>
      <div className="w-full h-full relative">
        {/* Search Bar - Left aligned with padding */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[430px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts and videos"
              className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
          </div>
        </div>
        
        {/* Buttons - Right side */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {/* Vendors Button */}
          <Link
            href="/vendor-enrollment"
            className="bg-[#dadde2] text-black px-4 py-2 rounded-md hover:bg-[#dadde2]/80 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span className="text-base font-semibold">Vendors</span>
          </Link>
          
          {/* Login Button */}
          <Link
            href="/login"
            className={cn("flex items-center gap-2 px-4 py-2 rounded-md transition", colorClasses.bgAccent, colorClasses.textPrimary, colorClasses.hoverAccent)}
          >
            <LogIn className="w-4 h-4" />
            <span className="font-medium">Login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}