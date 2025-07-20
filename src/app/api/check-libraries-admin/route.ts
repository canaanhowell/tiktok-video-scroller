import { NextResponse } from 'next/server'

export async function GET() {
  const BUNNY_ADMIN_KEY = process.env.bunny_cdn_admin_key?.trim() || 'e5bfd06a-fc66-4fa4-a04c-9898d59406c1af22c640-76ef-455b-889c-c6b0f190d89c'
  
  const libraries = {
    mobile_9x16: '467029',
    desktop_16x9: '469922'
  }
  
  const results: any = {}
  
  // Check each library with admin key
  for (const [name, libraryId] of Object.entries(libraries)) {
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
        results[name] = {
          libraryId,
          status: 'success',
          totalVideos: data.totalItems || 0,
          statusCode: response.status,
          videos: (data.items || []).slice(0, 5).map((v: any) => ({
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
  for (const [name, libraryId] of Object.entries(libraries)) {
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
  
  return NextResponse.json({
    adminKey: BUNNY_ADMIN_KEY.substring(0, 20) + '...',
    libraries: results,
    libraryInfo
  })
}