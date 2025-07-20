import { NextResponse } from 'next/server'

export async function GET() {
  const BUNNY_API_KEY = process.env.bunny_cdn_streaming_key?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
  const libraries = {
    mobile_9x16: process.env.bunny_cdn_video_streaming_library_9x16?.trim() || '467029',
    desktop_16x9: process.env.bunny_cdn_video_streaming_library_16x9?.trim() || '469922'
  }
  
  const results: any = {}
  
  // Test each library
  for (const [name, libraryId] of Object.entries(libraries)) {
    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=5&orderBy=date`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'accept': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        results[name] = {
          libraryId,
          status: 'success',
          totalVideos: data.totalItems || 0,
          videos: (data.items || []).map((v: any) => ({
            title: v.title,
            guid: v.guid,
            status: v.status,
            width: v.width,
            height: v.height,
            dateUploaded: v.dateUploaded
          }))
        }
      } else {
        const errorText = await response.text()
        results[name] = {
          libraryId,
          status: 'error',
          statusCode: response.status,
          error: errorText || response.statusText
        }
      }
    } catch (error) {
      results[name] = {
        libraryId,
        status: 'exception',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return NextResponse.json({
    apiKey: BUNNY_API_KEY.substring(0, 10) + '...',
    libraries: results
  })
}