import { NextResponse } from 'next/server'
import { getCategoryLibrary, type VendorCategory } from '@/config/categoryLibraries'

export async function GET() {
  const BUNNY_ADMIN_KEY = process.env.bunny_cdn_admin_key?.trim() || 'e5bfd06a-fc66-4fa4-a04c-9898d59406c1af22c640-76ef-455b-889c-c6b0f190d89c'
  
  // Check all category libraries
  const CATEGORIES: VendorCategory[] = ['default', 'photographers', 'venues', 'videographers', 'musicians', 'djs']
  const DEVICE_TYPES = ['mobile', 'desktop'] as const
  
  const libraries: Record<string, { libraryId: string, apiKey: string }> = {}
  
  // Build library list from all categories
  for (const category of CATEGORIES) {
    for (const deviceType of DEVICE_TYPES) {
      const config = getCategoryLibrary(category, deviceType)
      const key = `${category}_${deviceType}`
      libraries[key] = {
        libraryId: config.libraryId,
        apiKey: config.apiKey
      }
    }
  }
  
  const results: any = {}
  
  // Check each library with admin key
  for (const [name, lib] of Object.entries(libraries)) {
    const { libraryId, apiKey } = lib
    try {
      console.log(`[ADMIN] Checking library ${libraryId} with admin key`)
      
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=10&orderBy=date`,
        {
          headers: {
            'AccessKey': BUNNY_ADMIN_KEY,
            'accept': 'application/json'
          }
        }
      )
      
      const responseText = await response.text()
      
      if (response.ok) {
        const data = JSON.parse(responseText)
        const readyVideos = (data.items || []).filter((v: any) => v.status === 4)
        results[name] = {
          libraryId,
          categoryApiKey: apiKey.substring(0, 10) + '...',
          status: 'success',
          totalVideos: data.totalItems || 0,
          readyVideos: readyVideos.length,
          statusCode: response.status,
          videos: (data.items || []).slice(0, 3).map((v: any) => ({
            title: v.title,
            guid: v.guid,
            status: v.status,
            statusText: v.status === 4 ? 'ready' : `not ready (${v.status})`,
            width: v.width,
            height: v.height,
            aspectRatio: v.width && v.height ? `${v.width}:${v.height}` : 'unknown',
            dateUploaded: v.dateUploaded
          }))
        }
      } else {
        results[name] = {
          libraryId,
          status: 'error',
          statusCode: response.status,
          statusText: response.statusText,
          error: responseText
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
  
  // Also check library info endpoint
  const libraryInfo: any = {}
  for (const [name, lib] of Object.entries(libraries)) {
    const { libraryId } = lib
    try {
      const infoResponse = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}`,
        {
          headers: {
            'AccessKey': BUNNY_ADMIN_KEY,
            'accept': 'application/json'
          }
        }
      )
      
      if (infoResponse.ok) {
        const info = await infoResponse.json()
        libraryInfo[name] = {
          id: info.Id,
          name: info.Name,
          videoCount: info.VideoCount,
          dateCreated: info.DateCreated
        }
      } else {
        libraryInfo[name] = {
          error: `${infoResponse.status} ${infoResponse.statusText}`
        }
      }
    } catch (error) {
      libraryInfo[name] = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // Group by category for better readability
  const categorySummary: any = {}
  for (const category of CATEGORIES) {
    categorySummary[category] = {
      mobile: results[`${category}_mobile`] || {},
      desktop: results[`${category}_desktop`] || {}
    }
  }
  
  // Summary stats
  const summary = {
    totalLibraries: Object.keys(libraries).length,
    librariesChecked: Object.keys(results).length,
    librariesWithVideos: Object.values(results).filter((r: any) => r.status === 'success' && r.totalVideos > 0).length,
    emptyLibraries: Object.values(results).filter((r: any) => r.status === 'success' && r.totalVideos === 0).length,
    failedChecks: Object.values(results).filter((r: any) => r.status === 'error').length
  }
  
  return NextResponse.json({
    adminKey: BUNNY_ADMIN_KEY.substring(0, 20) + '...',
    summary,
    categorySummary,
    rawResults: results,
    libraryInfo
  })
}