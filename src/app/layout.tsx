import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { MainLayout } from '@/components/layout/MainLayout'
import { DeviceProvider } from '@/contexts/DeviceContext'
import { InteractionProvider } from '@/contexts/InteractionContext'
import { VideoManagerProvider } from '@/contexts/VideoManagerContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TikTok Video Scroller | Media',
  description: 'Cross-platform responsive vertical video scroller',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} overflow-x-hidden`}>
        <DeviceProvider>
          <InteractionProvider>
            <VideoManagerProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </VideoManagerProvider>
          </InteractionProvider>
        </DeviceProvider>
      </body>
    </html>
  )
}
