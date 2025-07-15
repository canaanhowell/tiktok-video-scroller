'use client'

import { Home, Compass, Users, MessageCircle, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

const navItems = [
  { icon: Home, href: '/', label: 'For You' },
  { icon: Compass, href: '/explore', label: 'Explore' },
  { icon: Users, href: '/following', label: 'Following' },
  { icon: MessageCircle, href: '/messages', label: 'Messages' },
  { icon: User, href: '/profile', label: 'Profile' },
  { icon: Settings, href: '/settings', label: 'Settings' },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:block fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 z-50">
      <div className="p-4">
        <Link href="/" className="text-2xl font-bold text-white">
          VideoScroller
        </Link>
      </div>
      
      <div className="mt-8">
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
      </div>
    </nav>
  )
}