import { NextRequest, NextResponse } from 'next/server'
import { bunnyClient, bunnyConfig } from '@/lib/bunny/client'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Fetch videos from Bunny Stream
    const response = await bunnyClient.stream.get('/videos', {
      params: {
        page,
        itemsPerPage: limit,
        orderBy: 'date' // Order by upload date
      }
    })
    
    // Transform the response to include playback URLs
    const videos = response.data.items.map((video: any) => ({
      id: video.guid,
      title: video.title,
      duration: video.length,
      views: video.views || 0,
      uploadDate: video.dateUploaded,
      status: video.status,
      videoUrl: bunnyConfig.getVideoUrl(video.guid),
      thumbnailUrl: bunnyConfig.getThumbnailUrl(video.guid),
      // For the video scroller format
      src: bunnyConfig.getVideoUrl(video.guid),
      poster: bunnyConfig.getThumbnailUrl(video.guid),
      username: 'user', // TODO: Get from Supabase when integrated
      description: video.title,
      likes: 0, // TODO: Get from Supabase
      comments: 0, // TODO: Get from Supabase
      shares: 0 // TODO: Get from Supabase
    }))
    
    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total: response.data.totalItems,
        totalPages: Math.ceil(response.data.totalItems / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}