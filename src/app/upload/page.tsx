'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoUploader } from '@/components/upload/VideoUploader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [uploadedVideo, setUploadedVideo] = useState(null)

  const handleUploadComplete = (videoData: any) => {
    console.log('Video uploaded:', videoData)
    setUploadedVideo(videoData)
    
    // Redirect to home after successful upload
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-semibold text-white">Upload Video</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Upload Content */}
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Share your video
            </h2>
            <p className="text-gray-400">
              Upload a video to share with the community
            </p>
          </div>

          <VideoUploader
            onUploadComplete={handleUploadComplete}
            onCancel={() => router.push('/')}
          />

          {/* Upload Guidelines */}
          <div className="mt-12 bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Upload Guidelines
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Maximum file size: 500MB</li>
              <li>• Supported formats: MP4, WebM, MOV, AVI</li>
              <li>• Recommended aspect ratio: 9:16 (vertical)</li>
              <li>• Minimum resolution: 720p</li>
              <li>• Keep content appropriate and respectful</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}