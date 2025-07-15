'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoUploaderProps {
  onUploadComplete?: (videoData: any) => void
  onCancel?: () => void
}

export function VideoUploader({ onUploadComplete, onCancel }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a valid video file (MP4, WebM, MOV, AVI)')
      return
    }

    // Validate file size (500MB)
    const maxSize = 500 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 500MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    
    // Create preview
    const url = URL.createObjectURL(selectedFile)
    setPreview(url)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const result = await response.json()
      setSuccess(true)
      setProgress(100)
      
      // Call callback with video data
      onUploadComplete?.(result.video)
      
      // Reset after delay
      setTimeout(() => {
        resetUploader()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload video')
      setUploading(false)
    }
  }

  const resetUploader = () => {
    setFile(null)
    setPreview(null)
    setProgress(0)
    setError(null)
    setSuccess(false)
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Select a video to upload
              </h3>
              <p className="text-gray-400 mb-4">
                MP4, WebM, MOV, or AVI • Max 500MB
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Choose File
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Video Preview */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                src={preview!}
                className="w-full h-64 object-contain"
                controls
              />
              {!uploading && !success && (
                <button
                  onClick={resetUploader}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              )}
            </div>

            {/* File Info */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {success && (
                  <Check size={24} className="text-green-500" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/20 border border-green-900 rounded-lg p-4 flex items-center gap-3"
              >
                <Check size={20} className="text-green-500 flex-shrink-0" />
                <p className="text-green-400">Video uploaded successfully!</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!uploading && !success && (
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upload Video
                </button>
                <button
                  onClick={onCancel || resetUploader}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}