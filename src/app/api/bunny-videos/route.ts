import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Get environment variables
const BUNNY_LIBRARY_ID_MOBILE = process.env.bunny_cdn_video_streaming_library_9x16?.trim() || '467029'
const BUNNY_LIBRARY_ID_DESKTOP = process.env.bunny_cdn_video_streaming_library_16x9?.trim() || '469922'

// Each library has its own API key
const BUNNY_API_KEY_MOBILE = process.env.bunny_cdn_video_streaming_key_9x16?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
const BUNNY_API_KEY_DESKTOP = process.env.bunny_cdn_video_streaming_key_16x9?.trim() || '6b9d2bc6-6ad4-47d1-9fbc96134fc8-c5dc-4643'

// Each library has its own hostname
const BUNNY_HOSTNAME_MOBILE = process.env.bunny_cdn_video_streaming_hostname_9x16?.trim() || 'vz-97606b97-31d.b-cdn.net'
const BUNNY_HOSTNAME_DESKTOP = process.env.bunny_cdn_video_streaming_hostname_16x9?.trim() || 'vz-b123ebaa-cf2.b-cdn.net'

// Wedding vendor categories and sample data
const VENDOR_CATEGORIES = {
  venues: ['venue', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'camera', 'portrait', 'shoot', 'picture', 'photography'],
  videographers: ['video', 'film', 'cinema', 'record', 'footage', 'videography'],
  musicians: ['music', 'band', 'song', 'perform', 'sing', 'musician', 'orchestra'],
  djs: ['dj', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
}

const VENDOR_NAMES = [
  'Elegant Events Co',
  'Golden Hour Photography',
  'Cinematic Weddings',
  'The Music Masters',
  'DJ Spectacular',
  'Forever Films',
  'Blissful Moments',
  'Royal Venues',
  'Harmony Musicians',
  'Captured Dreams',
  'Timeless Photography',
  'Epic Celebrations',
  'Love Story Films',
  'Dream Venues',
  'Perfect Moments'
]

const DESCRIPTIONS = [
  'Making your special day unforgettable 💕',
  'Capturing moments that last forever 📸',
  'Your dream wedding starts here ✨',
  'Creating magical memories 🎊',
  'Love stories beautifully told 💍',
  'Where dreams come true 🌟',
  'Celebrating love in style 🥂',
  'Your perfect day, our passion 💖',
  'Timeless elegance for your wedding 👰',
  'Making memories that matter 🎉',
  'Picture perfect moments 📷',
  'Unforgettable celebrations 🎈',
  'Romance in every frame 💝',
  'Your love, our canvas 🎨',
  'Forever starts here 💐'
]

// Helper function to transform videos
function transformVideos(videos: any[], hostname: string) {
  return videos
    .filter((video: any) => video.status === 4) // Only ready videos
    .map((video: any, index: number) => {
      // Generate vendor info
      const vendorName = VENDOR_NAMES[index % VENDOR_NAMES.length]
      const description = DESCRIPTIONS[index % DESCRIPTIONS.length]
      
      // Try to categorize based on video title
      let category = 'general'
      const lowerTitle = (video.title || '').toLowerCase()
      
      for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
        if (keywords.some(keyword => lowerTitle.includes(keyword))) {
          category = cat
          break
        }
      }
      
      // Generate engagement numbers
      const baseNumber = Math.floor(Math.random() * 10000) + 1000
      
      return {
        id: video.guid,
        src: `https://${hostname}/${video.guid}/playlist.m3u8`,
        username: vendorName.toLowerCase().replace(/\s+/g, ''),
        description: `${vendorName} - ${description}`,
        likes: baseNumber + Math.floor(Math.random() * 5000),
        comments: Math.floor(baseNumber / 20) + Math.floor(Math.random() * 100),
        shares: Math.floor(baseNumber / 50) + Math.floor(Math.random() * 50),
        category,
        title: video.title || 'Wedding Video',
        dateUploaded: video.dateUploaded
      }
    })
}

export async function GET(request: NextRequest) {
  try {
    // Get device type from query params
    const searchParams = request.nextUrl.searchParams
    const deviceType = searchParams.get('device') || 'mobile'
    
    // Select appropriate library, API key, and hostname based on device type
    const libraryId = deviceType === 'desktop' ? BUNNY_LIBRARY_ID_DESKTOP : BUNNY_LIBRARY_ID_MOBILE
    const apiKey = deviceType === 'desktop' ? BUNNY_API_KEY_DESKTOP : BUNNY_API_KEY_MOBILE
    const hostname = deviceType === 'desktop' ? BUNNY_HOSTNAME_DESKTOP : BUNNY_HOSTNAME_MOBILE
    
    console.log('[API] Fetching videos from Bunny CDN...')
    console.log('[API] Device type:', deviceType)
    console.log('[API] Library ID being used:', libraryId)
    console.log('[API] API Key being used:', apiKey.substring(0, 10) + '...')
    console.log('[API] Desktop Library (16x9):', BUNNY_LIBRARY_ID_DESKTOP)
    console.log('[API] Mobile Library (9x16):', BUNNY_LIBRARY_ID_MOBILE)
    console.log('[API] Full URL:', `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`)
    
    // Fetch videos from Bunny CDN
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`,
      {
        headers: {
          'AccessKey': apiKey,
          'accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('[API] Bunny CDN error:', response.status, response.statusText)
      
      // If desktop library fails, try mobile library as fallback
      if (deviceType === 'desktop' && response.status === 401) {
        console.log('[API] Desktop library authentication failed, falling back to mobile library')
        const fallbackResponse = await fetch(
          `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID_MOBILE}/videos?page=1&itemsPerPage=100&orderBy=date`,
          {
            headers: {
              'AccessKey': BUNNY_API_KEY_MOBILE,
              'accept': 'application/json'
            }
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          return NextResponse.json({
            success: true,
            videos: transformVideos(fallbackData.items || [], BUNNY_HOSTNAME_MOBILE),
            total: fallbackData.totalItems || 0,
            source: 'bunny-cdn-live',
            deviceType,
            libraryId: BUNNY_LIBRARY_ID_MOBILE,
            fallback: true,
            message: 'Desktop library unavailable, using mobile library'
          })
        }
      }
      
      throw new Error(`Bunny CDN API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[API] Bunny CDN response received, total videos:', data.totalItems)
    
    // Get videos array
    const videos = data.items || []
    console.log('[API] Processing', videos.length, 'videos')
    
    // Transform videos using helper function
    const transformedVideos = transformVideos(videos, hostname)
    
    console.log('[API] Returning', transformedVideos.length, 'ready videos from library', libraryId)
    if (transformedVideos.length > 0) {
      console.log('[API] First video title:', transformedVideos[0].title)
      console.log('[API] First video src:', transformedVideos[0].src)
    }
    
    return NextResponse.json({
      success: true,
      videos: transformedVideos,
      total: transformedVideos.length,
      source: 'bunny-cdn-live',
      deviceType,
      libraryId
    })
  } catch (error) {
    console.error('[API] Error fetching from Bunny CDN:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch videos',
      message: error instanceof Error ? error.message : 'Unknown error',
      videos: [],
      total: 0
    }, { status: 500 })
  }
}

// Also support POST for potential future filtering
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deviceType = body.device || 'mobile'
    
    // Create a new URL with the device parameter
    const url = new URL(request.url)
    url.searchParams.set('device', deviceType)
    
    // Create a new request with the updated URL
    const newRequest = new NextRequest(url)
    
    return GET(newRequest)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request',
      videos: [],
      total: 0
    }, { status: 400 })
  }
}