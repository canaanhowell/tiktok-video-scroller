import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const deviceType = searchParams.get('device') || 'mobile'
  
  const BUNNY_LIBRARY_ID_MOBILE = process.env.bunny_cdn_video_streaming_library_9x16?.trim() || '467029'
  const BUNNY_LIBRARY_ID_DESKTOP = process.env.bunny_cdn_video_streaming_library_16x9?.trim() || '469922'
  const BUNNY_API_KEY = process.env.bunny_cdn_streaming_key?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
  
  const libraryId = deviceType === 'desktop' ? BUNNY_LIBRARY_ID_DESKTOP : BUNNY_LIBRARY_ID_MOBILE
  
  // Fetch a sample video from the library to verify
  let sampleVideo = null
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=1&orderBy=date`,
      {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'application/json'
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      sampleVideo = data.items?.[0]
    }
  } catch (error) {
    console.error('Error fetching sample video:', error)
  }
  
  return NextResponse.json({
    deviceType,
    selectedLibraryId: libraryId,
    environmentVariables: {
      desktop_16x9: BUNNY_LIBRARY_ID_DESKTOP,
      mobile_9x16: BUNNY_LIBRARY_ID_MOBILE,
      desktop_16x9_raw: process.env.bunny_cdn_video_streaming_library_16x9,
      mobile_9x16_raw: process.env.bunny_cdn_video_streaming_library_9x16
    },
    sampleVideo: sampleVideo ? {
      title: sampleVideo.title,
      guid: sampleVideo.guid,
      width: sampleVideo.width,
      height: sampleVideo.height,
      aspectRatio: sampleVideo.width && sampleVideo.height ? `${sampleVideo.width}:${sampleVideo.height}` : 'unknown'
    } : null
  })
}