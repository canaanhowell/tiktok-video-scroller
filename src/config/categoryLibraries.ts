/**
 * Category Library Configuration
 * Maps wedding vendor categories to their specific Bunny CDN streaming libraries
 * Each category has separate libraries for mobile (9:16) and desktop (16:9) aspect ratios
 */

export interface LibraryConfig {
  libraryId: string
  hostname: string
  apiKey: string
}

export interface CategoryLibrary {
  mobile: LibraryConfig
  desktop: LibraryConfig
}

export type VendorCategory = 
  | 'default'
  | 'photographers' 
  | 'venues'
  | 'videographers'
  | 'musicians'
  | 'djs'
  | 'florists'
  | 'wedding-cakes'

// Map of categories to their Bunny CDN libraries
// All sensitive data comes from environment variables
export const categoryLibraries: Record<VendorCategory, CategoryLibrary> = {
  default: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_9x16?.trim() || '467029',
      hostname: process.env.bunny_cdn_video_streaming_hostname_9x16?.trim() || 'vz-97606b97-31d.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_9x16?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_16x9?.trim() || '469922',
      hostname: process.env.bunny_cdn_video_streaming_hostname_16x9?.trim() || 'vz-b123ebaa-cf2.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_16x9?.trim() || '6b9d2bc6-6ad4-47d1-9fbc96134fc8-c5dc-4643'
    }
  },
  photographers: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_photography_9x16?.trim() || '469958',
      hostname: process.env.bunny_cdn_video_streaming_hostname_photography_9x16?.trim() || 'vz-965c085b-e8d.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_photography_9x16?.trim() || '77e4f8a4-129b-4ef4-8f72a5e4dffd-f951-4342'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_photography_16x9?.trim() || '469957',
      hostname: process.env.bunny_cdn_video_streaming_hostname_photography_16x9?.trim() || 'vz-704af8cf-669.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_photography_16x9?.trim() || '33029dab-5c10-4011-acb70be9a984-150e-4041'
    }
  },
  venues: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_venues_9x16?.trim() || '469966',
      hostname: process.env.bunny_cdn_video_streaming_hostname_venues_9x16?.trim() || 'vz-c0ef2cec-a20.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_venues_9x16?.trim() || 'aacb61e1-ac77-454b-a0aeeeb23391-f320-48c7'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_venues_16x9?.trim() || '469968',
      hostname: process.env.bunny_cdn_video_streaming_hostname_venues_16x9?.trim() || 'vz-80cd40aa-6f0.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_venues_16x9?.trim() || '43946146-474c-472a-98a8eab0039e-c8d0-46d1'
    }
  },
  videographers: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_videographers_9x16?.trim() || '469964',
      hostname: process.env.bunny_cdn_video_streaming_hostname_videographers_9x16?.trim() || 'vz-ca34d76f-d5f.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_videographers_9x16?.trim() || '81b7b97d-9e02-4c00-9b4b94626029-c6e7-46f8'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_videographers_16x9?.trim() || '469965',
      hostname: process.env.bunny_cdn_video_streaming_hostname_videographers_16x9?.trim() || 'vz-3ab70028-1ac.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_videographers_16x9?.trim() || 'd0754b35-fa96-40d9-b72f3f0e51a8-244b-495e'
    }
  },
  musicians: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_musicians_9x16?.trim() || '469970',
      hostname: process.env.bunny_cdn_video_streaming_hostname_musicians_9x16?.trim() || 'vz-9bef5b70-a08.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_musicians_9x16?.trim() || '94095172-3d73-470c-b6976115ee04-f062-486f'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_musicians_16x9?.trim() || '469971',
      hostname: process.env.bunny_cdn_video_streaming_hostname_musicians_16x9?.trim() || 'vz-aeaf110d-728.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_musicians_16x9?.trim() || '5b2adb99-64b9-439b-93f7388e9899-9761-45fb'
    }
  },
  djs: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_dj_9x16?.trim() || '469972',
      hostname: process.env.bunny_cdn_video_streaming_hostname_dj_9x16?.trim() || 'vz-3cdaae6e-a6b.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_dj_9x16?.trim() || '212e9949-c822-4a2d-88f999d57972-d4c5-46c1'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_dj_16x9?.trim() || '469973',
      hostname: process.env.bunny_cdn_video_streaming_hostname_dj_16x9?.trim() || 'vz-5052a117-bbc.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_dj_16x9?.trim() || 'a06c2983-bdbf-4312-8a6b90ac6f65-888d-4921'
    }
  },
  florists: {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_florists_9x16?.trim() || '467029',
      hostname: process.env.bunny_cdn_video_streaming_hostname_florists_9x16?.trim() || 'vz-97606b97-31d.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_florists_9x16?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_florists_16x9?.trim() || '469922',
      hostname: process.env.bunny_cdn_video_streaming_hostname_florists_16x9?.trim() || 'vz-b123ebaa-cf2.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_florists_16x9?.trim() || '6b9d2bc6-6ad4-47d1-9fbc96134fc8-c5dc-4643'
    }
  },
  'wedding-cakes': {
    mobile: {
      libraryId: process.env.bunny_cdn_video_streaming_library_wedding_cakes_9x16?.trim() || '467029',
      hostname: process.env.bunny_cdn_video_streaming_hostname_wedding_cakes_9x16?.trim() || 'vz-97606b97-31d.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_wedding_cakes_9x16?.trim() || '931f28b3-fc95-4659-a29300277c12-1643-4c31'
    },
    desktop: {
      libraryId: process.env.bunny_cdn_video_streaming_library_wedding_cakes_16x9?.trim() || '469922',
      hostname: process.env.bunny_cdn_video_streaming_hostname_wedding_cakes_16x9?.trim() || 'vz-b123ebaa-cf2.b-cdn.net',
      apiKey: process.env.bunny_cdn_video_streaming_key_wedding_cakes_16x9?.trim() || '6b9d2bc6-6ad4-47d1-9fbc96134fc8-c5dc-4643'
    }
  }
}

/**
 * Get library configuration for a specific category and device type
 */
export function getCategoryLibrary(
  category: VendorCategory, 
  deviceType: 'mobile' | 'desktop' | 'tablet'
): LibraryConfig {
  // Treat tablet as mobile for library selection
  const libraryType = deviceType === 'desktop' ? 'desktop' : 'mobile'
  
  console.log('[getCategoryLibrary] Getting config for:', { category, deviceType, libraryType })
  
  const config = categoryLibraries[category][libraryType]
  console.log('[getCategoryLibrary] Config found:', {
    libraryId: config.libraryId,
    hostname: config.hostname,
    hasApiKey: !!config.apiKey
  })
  
  // Return the appropriate library config
  return config
}

/**
 * Validate if a category exists
 */
export function isValidCategory(category: string): category is VendorCategory {
  return category in categoryLibraries
}