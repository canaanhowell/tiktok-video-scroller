import { NextResponse } from 'next/server'

export async function GET() {
  const streamingKey = process.env.bunny_cdn_streaming_key?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
  const adminKey = process.env.bunny_cdn_admin_key?.trim() || 'e5bfd06a-fc66-4fa4-a04c-9898d59406c1af22c640-76ef-455b-889c-c6b0f190d89c'
  
  const results: any = {
    streaming_key_test: {},
    admin_key_test: {},
    library_469922_test: {}
  }
  
  // Test streaming key with mobile library (467029)
  try {
    const response = await fetch(
      'https://video.bunnycdn.com/library/467029/videos?page=1&itemsPerPage=1',
      {
        headers: {
          'AccessKey': streamingKey,
          'accept': 'application/json'
        }
      }
    )
    
    results.streaming_key_test = {
      library: '467029',
      status: response.status,
      statusText: response.statusText,
      success: response.ok
    }
    
    if (response.ok) {
      const data = await response.json()
      results.streaming_key_test.totalVideos = data.totalItems
    }
  } catch (error) {
    results.streaming_key_test.error = error instanceof Error ? error.message : 'Unknown error'
  }
  
  // Test admin key with mobile library
  try {
    const response = await fetch(
      'https://video.bunnycdn.com/library/467029/videos?page=1&itemsPerPage=1',
      {
        headers: {
          'AccessKey': adminKey,
          'accept': 'application/json'
        }
      }
    )
    
    results.admin_key_test = {
      library: '467029',
      status: response.status,
      statusText: response.statusText,
      success: response.ok
    }
  } catch (error) {
    results.admin_key_test.error = error instanceof Error ? error.message : 'Unknown error'
  }
  
  // Test desktop library with both keys
  for (const [keyName, key] of [['streaming', streamingKey], ['admin', adminKey]]) {
    try {
      const response = await fetch(
        'https://video.bunnycdn.com/library/469922/videos?page=1&itemsPerPage=1',
        {
          headers: {
            'AccessKey': key,
            'accept': 'application/json'
          }
        }
      )
      
      results.library_469922_test[keyName] = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        results.library_469922_test[keyName].errorBody = errorText
      }
    } catch (error) {
      results.library_469922_test[keyName] = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return NextResponse.json({
    results,
    keys: {
      streaming: streamingKey.substring(0, 20) + '...',
      admin: adminKey.substring(0, 20) + '...'
    },
    env_vars: {
      library_16x9: process.env.bunny_cdn_video_streaming_library_16x9,
      library_9x16: process.env.bunny_cdn_video_streaming_library_9x16
    }
  })
}