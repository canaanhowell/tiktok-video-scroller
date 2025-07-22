import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getCategoryLibrary, isValidCategory, type VendorCategory } from '@/config/categoryLibraries'

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
      // Check if video has metaTags from Bunny CDN
      const metaTags = video.metaTags || {}
      
      // Use metaTags if available, otherwise fall back to generated data
      const vendorName = metaTags.vendorName || metaTags.vendor || VENDOR_NAMES[index % VENDOR_NAMES.length]
      const vendorCity = metaTags.vendorCity || metaTags.city || 'Nashville'
      const vendorState = metaTags.state || 'Tennessee'
      const vendorZipcode = metaTags.zipcode || '37201'
      const vendorWebsite = metaTags.vendorWebsite || metaTags.website || `www.${vendorName.toLowerCase().replace(/\s+/g, '')}.com`
      
      // Category from metaTags or try to detect from title
      let category = metaTags.category || 'general'
      if (!metaTags.category) {
        const lowerTitle = (video.title || '').toLowerCase()
        for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
          if (keywords.some(keyword => lowerTitle.includes(keyword))) {
            category = cat
            break
          }
        }
      }
      
      // Description with vendor name and location
      const description = metaTags.description || 
        `${vendorName} - ${DESCRIPTIONS[index % DESCRIPTIONS.length]} | ${vendorCity}, ${vendorState}`
      
      // Generate engagement numbers (could also store these in metaTags)
      const baseNumber = Math.floor(Math.random() * 10000) + 1000
      
      return {
        id: video.guid,
        src: `https://${hostname}/${video.guid}/playlist.m3u8`,
        username: vendorName.toLowerCase().replace(/\s+/g, ''),
        description: description,
        likes: metaTags.likes || baseNumber + Math.floor(Math.random() * 5000),
        comments: metaTags.comments || Math.floor(baseNumber / 20) + Math.floor(Math.random() * 100),
        shares: metaTags.shares || Math.floor(baseNumber / 50) + Math.floor(Math.random() * 50),
        
        // Vendor metadata
        category,
        vendorName: vendorName,
        vendorWebsite: vendorWebsite,
        vendorCity: vendorCity,
        vendorState: vendorState,
        vendorZipcode: vendorZipcode,
        
        // Video metadata
        title: video.title || 'Wedding Video',
        dateUploaded: video.dateUploaded,
        
        // Store original metaTags for debugging
        metaTags: metaTags
      }
    })
}

export async function GET(request: NextRequest) {
  try {
    // Get device type and category from query params
    const searchParams = request.nextUrl.searchParams
    const deviceType = searchParams.get('device') || 'mobile'
    const categoryParam = searchParams.get('category') || 'default'
    
    // Validate and get category
    const category: VendorCategory = isValidCategory(categoryParam) ? categoryParam : 'default'
    
    // Get library configuration based on category and device type
    const libraryConfig = getCategoryLibrary(category, deviceType as 'mobile' | 'desktop' | 'tablet')
    const { libraryId, apiKey, hostname } = libraryConfig
    
    console.log('[API] Fetching videos from Bunny CDN...')
    console.log('[API] Category:', category)
    console.log('[API] Device type:', deviceType)
    console.log('[API] Library ID being used:', libraryId)
    console.log('[API] API Key being used:', apiKey.substring(0, 10) + '...')
    console.log('[API] Hostname:', hostname)
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
      
      // If category library fails, try default library as fallback
      if (category !== 'default' && response.status === 401) {
        console.log(`[API] ${category} library authentication failed, falling back to default library`)
        const defaultConfig = getCategoryLibrary('default', deviceType as 'mobile' | 'desktop' | 'tablet')
        const fallbackResponse = await fetch(
          `https://video.bunnycdn.com/library/${defaultConfig.libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`,
          {
            headers: {
              'AccessKey': defaultConfig.apiKey,
              'accept': 'application/json'
            }
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          return NextResponse.json({
            success: true,
            videos: transformVideos(fallbackData.items || [], defaultConfig.hostname),
            total: fallbackData.totalItems || 0,
            source: 'bunny-cdn-live',
            category,
            deviceType,
            libraryId: defaultConfig.libraryId,
            fallback: true,
            message: `${category} library unavailable, using default library`
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
      category,
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