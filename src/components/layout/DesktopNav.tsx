'use client'

import { MapPin, Camera, Video, Music, Disc3, Building2, UserPlus, Settings, Heart, TrendingUp, Flower2, Cake } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { colors, colorClasses } from '@/config/colors'

const topNavItems: never[] = []

const navItems = [
  { icon: TrendingUp, href: '/popular', label: 'Popular' },
  { icon: MapPin, href: '/venues', label: 'Venues' },
  { icon: Camera, href: '/photographers', label: 'Photographers' },
  { icon: Video, href: '/videographers', label: 'Videographers' },
  { icon: Music, href: '/musicians', label: 'Musicians' },
  { icon: Disc3, href: '/djs', label: "DJ's" },
  { icon: Flower2, href: '/florists', label: 'Florists' },
  { icon: Cake, href: '/wedding-cakes', label: 'Wedding Cakes' },
]

const bottomNavItems = [
  { icon: Heart, href: '/saved', label: 'Saved' },
  { icon: Building2, href: '/vendor-hq', label: 'Vendor HQ' },
  { icon: Settings, href: '/settings', label: 'Settings' },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav 
      className={cn("hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 overflow-y-auto", colorClasses.bgSecondary)}
      style={{
        '--base-font-size': 'clamp(0.875rem, 2.1vh, 1.125rem)',
        '--header-font-size': 'clamp(1.25rem, 3vh, 1.75rem)',
        '--icon-size': 'clamp(18px, 2.5vh, 24px)',
        '--padding-y': 'clamp(0.625rem, 1.5vh, 0.875rem)',
        '--padding-x': 'clamp(1.25rem, 2vh, 1.75rem)',
        '--button-padding-x': 'clamp(2rem, 3vh, 2.5rem)',
      } as React.CSSProperties}
    >
      {/* Header - Fixed height */}
      <div className="h-64 flex items-center justify-center flex-shrink-0 py-8">
        <Link href="/" className="flex items-center w-full justify-center">
          <img 
            src="/assets/logo/true_harmonic_logo_transparent.png" 
            alt="True Harmonic" 
            className="w-auto max-w-[85%]"
            style={{ height: '240px' }}
          />
        </Link>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto py-4">
        
        {/* Category Header */}
        <div className="pb-2" style={{ paddingLeft: 'var(--padding-x)', paddingRight: 'var(--padding-x)' }}>
          <h3 className="text-gray-800 font-bold" style={{ fontSize: 'var(--base-font-size)' }}>Category</h3>
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
                'flex items-center gap-3',
                'transition-colors duration-200 hover:bg-true-harmonic-secondary/30',
                isActive ? 'text-gray-800 bg-true-harmonic-secondary/50' : 'text-gray-700'
              )}
              style={{ paddingLeft: 'var(--padding-x)', paddingRight: 'var(--padding-x)', paddingTop: 'var(--padding-y)', paddingBottom: 'var(--padding-y)' }}
            >
              <Icon style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
              <span style={{ fontSize: 'var(--base-font-size)' }}>{item.label}</span>
            </Link>
          )
        })}
        
        {/* Separator */}
        <div className="my-4 border-t border-gray-400/30" style={{ marginLeft: 'var(--padding-x)', marginRight: 'var(--padding-x)' }} />
        
        {/* Bottom Navigation Section - Vendor HQ & Settings */}
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3',
                'transition-colors duration-200 hover:bg-true-harmonic-secondary/30',
                isActive ? 'text-gray-800 bg-true-harmonic-secondary/50' : 'text-gray-700'
              )}
              style={{ paddingLeft: 'var(--padding-x)', paddingRight: 'var(--padding-x)', paddingTop: 'var(--padding-y)', paddingBottom: 'var(--padding-y)' }}
            >
              <Icon style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
              <span style={{ fontSize: 'var(--base-font-size)' }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}