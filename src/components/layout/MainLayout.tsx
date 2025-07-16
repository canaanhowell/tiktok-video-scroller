'use client'

import { ReactNode } from 'react'
import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'
import { TopNav } from './TopNav'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation for Desktop */}
      <TopNav />
      
      {/* Desktop Side Navigation */}
      <DesktopNav />
      
      {/* Main Content */}
      <main className="md:ml-64">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}