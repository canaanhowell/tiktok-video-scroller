'use client'

import { useState, useEffect, useRef } from 'react'
import { Home, Search, ChevronUp, Heart, MapPin, Camera, Video, Music, Disc3, TrendingUp, Flower2, Cake, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const vendorCategories = [
  { icon: TrendingUp, href: '/popular', label: 'Popular' },
  { icon: MapPin, href: '/venues', label: 'Venues' },
  { icon: Camera, href: '/photographers', label: 'Photographers' },
  { icon: Video, href: '/videographers', label: 'Videographers' },
  { icon: Music, href: '/musicians', label: 'Musicians' },
  { icon: Users, href: '/bands', label: 'Bands' },
  { icon: Disc3, href: '/djs', label: "DJ's" },
  { icon: Flower2, href: '/florists', label: 'Florists' },
  { icon: Cake, href: '/wedding-cakes', label: 'Wedding Cakes' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [showCategories, setShowCategories] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCategories(false)
      }
    }

    if (showCategories) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategories])

  return (
    <>
      {/* Category Menu Overlay */}
      {showCategories && (
        <div 
          ref={menuRef}
          className="fixed bottom-16 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-t border-white/20 md:hidden"
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {vendorCategories.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowCategories(false)}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4',
                    'transition-colors duration-200 hover:bg-white/20',
                    isActive ? 'text-white bg-white/20' : 'text-white/80'
                  )}
                >
                  <Icon size={24} />
                  <span className="text-lg">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-sm border-t border-white/20 md:hidden">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full tap-highlight-transparent',
              'transition-colors duration-200',
              pathname === '/' ? 'text-white' : 'text-white/80'
            )}
          >
            <Home size={24} />
            <span className="text-xxs mt-1">Home</span>
          </Link>

          <Link
            href="/search"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full tap-highlight-transparent',
              'transition-colors duration-200',
              pathname === '/search' ? 'text-white' : 'text-white/80'
            )}
          >
            <Search size={24} />
            <span className="text-xxs mt-1">Search</span>
          </Link>

          <button
            onClick={() => setShowCategories(!showCategories)}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full tap-highlight-transparent',
              'transition-colors duration-200',
              showCategories ? 'text-white' : 'text-white/80'
            )}
          >
            <ChevronUp size={24} className={cn(
              'transition-transform duration-200',
              showCategories ? 'rotate-180' : ''
            )} />
            <span className="text-xxs mt-1">Category</span>
          </button>

          <Link
            href="/saved"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full tap-highlight-transparent',
              'transition-colors duration-200',
              pathname === '/saved' ? 'text-white' : 'text-white/80'
            )}
          >
            <Heart size={24} />
            <span className="text-xxs mt-1">Saved</span>
          </Link>
        </div>
      </nav>
    </>
  )
}