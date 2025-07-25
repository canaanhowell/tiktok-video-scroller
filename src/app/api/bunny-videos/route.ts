import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getCategoryLibrary, isValidCategory, type VendorCategory } from '@/config/categoryLibraries'

// Wedding vendor categories and sample data
const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
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
function transformVideos(videos: any[], hostname: string, requestedCategory?: string) {
  return videos
    .filter((video: any) => video.status === 4) // Only ready videos
    .map((video: any, index: number) => {
      // First, try to parse metadata from moments field (new approach)
      let parsedMetadata: any = {}
      if (video.moments && Array.isArray(video.moments)) {
        video.moments.forEach((moment: any) => {
          if (moment.label && moment.label.includes(':')) {
            const [key, ...valueParts] = moment.label.split(':')
            const value = valueParts.join(':') // Handle values with colons
            parsedMetadata[key] = value
          }
        })
        
        // Debug log if we found metadata in moments
        if (Object.keys(parsedMetadata).length > 0) {
          console.log(`[API] Found metadata in moments for video "${video.title}":`, parsedMetadata)
        }
      }
      
      // Check if video has metaTags from Bunny CDN (old approach)
      const metaTags = video.metaTags || {}
      
      // Use parsed moments data first, then metaTags, then fall back to generated data
      const vendorName = parsedMetadata.vendorName || metaTags.vendorName || metaTags.vendor || VENDOR_NAMES[index % VENDOR_NAMES.length]
      const vendorCity = parsedMetadata.vendorCity || metaTags.vendorCity || metaTags.city || 'Nashville'
      const vendorState = parsedMetadata.vendorState || metaTags.state || 'Tennessee'
      const vendorZipcode = parsedMetadata.vendorZipcode || metaTags.zipcode || '37201'
      const vendorWebsite = parsedMetadata.vendorWebsite || metaTags.vendorWebsite || metaTags.website || `www.${vendorName.toLowerCase().replace(/\s+/g, '')}.com`
      
      // Description with vendor name and location
      const description = metaTags.description || 
        `${vendorName} - ${DESCRIPTIONS[index % DESCRIPTIONS.length]} | ${vendorCity}, ${vendorState}`
      
      // Category logic: Only trust requested category for specific vendor categories
      let category = parsedMetadata.category || metaTags.category || 'general'
      const isVendorCategory = ['photographers', 'venues', 'videographers', 'musicians', 'djs', 'florists', 'wedding-cakes', 'bands'].includes(requestedCategory || '')
      
      if (isVendorCategory) {
        // If we're fetching from a specific vendor category library, use that category
        category = requestedCategory
      } else if (!parsedMetadata.category && !metaTags.category) {
        // For general libraries (default, popular, saved), detect category from vendor name first (more reliable)
        const vendorText = `${vendorName} ${description}`.toLowerCase()
        const titleText = (video.title || '').toLowerCase()
        
        // First try vendor name + description (more reliable)
        const categoryOrder: (keyof typeof VENDOR_CATEGORIES)[] = ['videographers', 'photographers', 'musicians', 'djs', 'venues', 'general']
        for (const cat of categoryOrder) {
          const keywords = VENDOR_CATEGORIES[cat]
          if (keywords && keywords.some(keyword => vendorText.includes(keyword))) {
            category = cat
            break
          }
        }
        
        // If no match found in vendor name, try title as fallback
        if (category === 'general') {
          const searchText = `${titleText} ${vendorText}`.toLowerCase()
          for (const cat of categoryOrder) {
            const keywords = VENDOR_CATEGORIES[cat]
            if (keywords && keywords.some(keyword => searchText.includes(keyword))) {
              category = cat
              break
            }
          }
        }
      }
      
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
            videos: transformVideos(fallbackData.items || [], defaultConfig.hostname, 'default'),
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
    const transformedVideos = transformVideos(videos, hostname, category)
    
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