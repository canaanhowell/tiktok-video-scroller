import { NextRequest, NextResponse } from 'next/server'
import { BunnyVideoUploader } from '@/lib/bunny/upload'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      )
    }
    
    // Upload to Bunny CDN
    const result = await BunnyVideoUploader.uploadVideo(file)
    
    // TODO: Save video metadata to Supabase
    // This would include the videoId, userId, title, description, etc.
    
    return NextResponse.json({
      success: true,
      video: result
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// Configuration for larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb'
    }
  }
}