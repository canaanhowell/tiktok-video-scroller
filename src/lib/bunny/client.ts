import axios from 'axios'

// Bunny CDN configuration from environment variables
const STORAGE_ZONE = process.env.bunny_cdn_storage_zone
const STORAGE_KEY = process.env.bunny_cdn_storage_key
const STREAMING_LIBRARY = process.env.bunny_cdn_streaming_library
const STREAMING_HOSTNAME = process.env.bunny_cdn_streaming_hostname
const STREAMING_KEY = process.env.bunny_cdn_streaming_key
const ADMIN_KEY = process.env.bunny_cdn_admin_key

// Base URLs for Bunny CDN APIs
const STORAGE_API_URL = `https://storage.bunnycdn.com/${STORAGE_ZONE}`
const STREAM_API_URL = 'https://video.bunnycdn.com/library'

export const bunnyClient = {
  storage: axios.create({
    baseURL: STORAGE_API_URL,
    headers: {
      'AccessKey': STORAGE_KEY,
      'Content-Type': 'application/octet-stream'
    }
  }),
  
  stream: axios.create({
    baseURL: `${STREAM_API_URL}/${STREAMING_LIBRARY}`,
    headers: {
      'AccessKey': STREAMING_KEY,
      'accept': 'application/json'
    }
  }),
  
  admin: axios.create({
    baseURL: 'https://api.bunny.net',
    headers: {
      'AccessKey': ADMIN_KEY,
      'accept': 'application/json'
    }
  })
}

export const bunnyConfig = {
  storageZone: STORAGE_ZONE,
  streamingLibrary: STREAMING_LIBRARY,
  streamingHostname: STREAMING_HOSTNAME,
  
  // Helper to construct video URLs
  getVideoUrl: (videoId: string) => {
    return `https://${STREAMING_HOSTNAME}/${videoId}/playlist.m3u8`
  },
  
  getThumbnailUrl: (videoId: string) => {
    return `https://${STREAMING_HOSTNAME}/${videoId}/thumbnail.jpg`
  }
}