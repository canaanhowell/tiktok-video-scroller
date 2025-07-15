export default function Home() {
  return (
    <div className="h-screen w-full relative">
      {/* Video Scroller Container */}
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">TikTok Video Scroller</h1>
          <p className="text-gray-400 mb-8">🚀 Ready to build the video experience!</p>
          
          {/* Responsive info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📱 Mobile First</h3>
              <p className="text-sm text-gray-400">Optimized for touch gestures</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🎥 HLS Streaming</h3>
              <p className="text-sm text-gray-400">Powered by Bunny CDN</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">⚡ Real-time</h3>
              <p className="text-sm text-gray-400">Supabase + Redis caching</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom padding for nav */}
      <div className="h-16 md:hidden" />
    </div>
  )
}
