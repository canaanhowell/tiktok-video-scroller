'use client'

import { MapPin, Camera, Video, Music, Disc3, Building2, UserPlus, Settings, Heart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { colors, colorClasses } from '@/config/colors'

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
    <nav className={cn("hidden md:block fixed left-0 top-0 h-screen w-64 z-40", colorClasses.bgSecondary)}>
      <div className="h-16 flex items-center px-6">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          True Harmonic
        </Link>
      </div>
      
      <div className="mt-8">
        {/* Vendor Enrollment Button */}
        <div className="px-6 mb-4">
          <Link
            href="/vendor-enrollment"
            className={cn("flex items-center justify-center gap-2 px-4 py-2 rounded-md transition w-full", colorClasses.bgAccent, colorClasses.textPrimary, colorClasses.hoverAccent)}
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
                'transition-colors duration-200 hover:bg-true-harmonic-secondary/30',
                isActive ? 'text-gray-800 bg-true-harmonic-secondary/50' : 'text-gray-700'
              )}
            >
              <Icon size={24} />
              <span className="text-lg">{item.label}</span>
            </Link>
          )
        })}
        
        {/* 50px margin between sections */}
        <div className="h-[50px]" />
        
        {/* Category Header */}
        <div className="px-6 pb-4">
          <h3 className="text-gray-800 font-bold text-lg">Category</h3>
        </div>
        
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
                'transition-colors duration-200 hover:bg-true-harmonic-secondary/30',
                isActive ? 'text-gray-800 bg-true-harmonic-secondary/50' : 'text-gray-700'
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
                'transition-colors duration-200 hover:bg-true-harmonic-secondary/30',
                isActive ? 'text-gray-800 bg-true-harmonic-secondary/50' : 'text-gray-700'
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