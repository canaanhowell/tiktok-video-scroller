'use client'

import { MapPin, Camera, Video, Music, Disc3, Building2, UserPlus, Settings, Heart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const topNavItems = [
  { icon: Building2, href: '/vendor-hq', label: 'Vendor HQ' },
]

const navItems = [
  { icon: Heart, href: '/saved', label: 'Saved' },
  { icon: MapPin, href: '/venues', label: 'Venues' },
  { icon: Camera, href: '/photographers', label: 'Photographers' },
  { icon: Video, href: '/videographers', label: 'Videographers' },
  { icon: Music, href: '/musicians', label: 'Musicians' },
  { icon: Disc3, href: '/djs', label: "DJ's" },
]

const bottomNavItems = [
  { icon: Settings, href: '/settings', label: 'Settings' },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:block fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-black border-r border-gray-800 z-40">
      <div className="p-4">
        {/* Logo moved to TopNav */}
      </div>
      
      <div className="mt-8">
        {/* Vendor Enrollment Button */}
        <div className="px-6 mb-4">
          <Link
            href="/vendor-enrollment"
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition w-full"
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">Vendor Enrollment</span>
          </Link>
        </div>
        
        {/* Top Navigation Section - Vendor HQ */}
        {topNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-4',
                'transition-colors duration-200 hover:bg-gray-900',
                isActive ? 'text-white bg-gray-900' : 'text-gray-400'
              )}
            >
              <Icon size={24} />
              <span className="text-lg">{item.label}</span>
            </Link>
          )
        })}
        
        {/* 50px margin between sections */}
        <div className="h-[50px]" />
        
        {/* Middle Navigation Section - Vendor Categories */}
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-4',
                'transition-colors duration-200 hover:bg-gray-900',
                isActive ? 'text-white bg-gray-900' : 'text-gray-400'
              )}
            >
              <Icon size={24} />
              <span className="text-lg">{item.label}</span>
            </Link>
          )
        })}
        
        {/* 50px margin between sections */}
        <div className="h-[50px]" />
        
        {/* Bottom Navigation Section - Settings */}
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-4',
                'transition-colors duration-200 hover:bg-gray-900',
                isActive ? 'text-white bg-gray-900' : 'text-gray-400'
              )}
            >
              <Icon size={24} />
              <span className="text-lg">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}