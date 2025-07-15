'use client'

import { Home, Search, Plus, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: Home, href: '/', label: 'Home' },
  { icon: Search, href: '/search', label: 'Search' },
  { icon: Plus, href: '/upload', label: 'Upload' },
  { icon: MessageCircle, href: '/messages', label: 'Messages' },
  { icon: User, href: '/profile', label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full tap-highlight-transparent',
                'transition-colors duration-200',
                isActive ? 'text-white' : 'text-gray-400'
              )}
            >
              <Icon size={24} />
              <span className="text-xxs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}