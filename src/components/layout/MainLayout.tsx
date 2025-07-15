'use client'

import { ReactNode } from 'react'
import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Navigation */}
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