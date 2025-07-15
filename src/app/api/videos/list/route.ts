import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Bunny CDN configuration from environment
    const STREAMING_LIBRARY = process.env.bunny_cdn_streaming_library
    const STREAMING_KEY = process.env.bunny_cdn_streaming_key
    const STREAMING_HOSTNAME = process.env.bunny_cdn_streaming_hostname
    
    // Fetch videos from Bunny Stream
    const response = await axios.get(
      `https://video.bunnycdn.com/library/${STREAMING_LIBRARY}/videos`, 
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': STREAMING_KEY
        },
        params: {
          page,
          itemsPerPage: limit,
          orderBy: 'date'
        }
      }
    )
    
    // Transform the response to include playback URLs
    const videos = response.data.items.map((video: any) => ({
      id: video.guid,
      title: video.title,
      duration: video.length,
      views: video.views || 0,
      uploadDate: video.dateUploaded,
      status: video.status,
      videoUrl: `https://${STREAMING_HOSTNAME}/${video.guid}/playlist.m3u8`,
      thumbnailUrl: `https://${STREAMING_HOSTNAME}/${video.guid}/thumbnail.jpg`,
      // For the video scroller format
      src: `https://${STREAMING_HOSTNAME}/${video.guid}/playlist.m3u8`,
      poster: `https://${STREAMING_HOSTNAME}/${video.guid}/thumbnail.jpg`,
      username: video.title.includes('TikTok') ? `user_${video.title.match(/\d+/)?.[0] || '1'}` : 'user',
      description: video.title || 'Uploaded video',
      likes: Math.floor(Math.random() * 10000), // Random for now
      comments: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 200)
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
  } catch (error: any) {
    console.error('Error fetching videos:', error.response?.data || error.message)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}