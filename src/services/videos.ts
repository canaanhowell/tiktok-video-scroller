/**
 * Video Service Layer
 * Abstract interface for video operations
 * Separates frontend from backend video implementation
 */

export interface Video {
  id: string
  src: string
  poster?: string
  username: string
  description: string
  likes: number
  comments: number
  shares: number
  views: number
  duration: number
  createdAt: string
  creatorId: string
  categoryId?: string
  tags: string[]
  isPublic: boolean
}

export interface VideoMetadata {
  title: string
  description: string
  tags: string[]
  categoryId?: string
  isPublic: boolean
  thumbnailUrl?: string
}

export interface VideoUpload {
  file: File
  metadata: VideoMetadata
  progressCallback?: (progress: number) => void
}

export interface VideoFilters {
  categoryId?: string
  tags?: string[]
  duration?: 'short' | 'medium' | 'long'
  sortBy?: 'newest' | 'popular' | 'trending'
  limit?: number
  offset?: number
}

export interface VideoPerformance {
  videoId: string
  views: number
  likes: number
  comments: number
  shares: number
  watchTime: number
  engagement: number
  demographics: {
    ageGroups: Record<string, number>
    locations: Record<string, number>
  }
}

/**
 * Video Service Class
 * To be implemented by backend team with their chosen technology
 */
export class VideoService {

  /**
   * Get personalized video feed for user
   */
  async getVideoFeed(userId: string, filters?: VideoFilters): Promise<Video[]> {
    // TODO: Implement via backend API
    console.log('VideoService.getVideoFeed - To be implemented by backend')
    
    // Temporary mock data for development - using actual Bunny CDN videos
    return [
      {
        id: 'b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f',
        src: 'https://vz-97606b97-31d.b-cdn.net/b5a4dfe3-2bc7-4fa3-a6dd-3ec36aceff8f/playlist.m3u8',
        username: 'synthetikmedia',
        description: 'Romance Wedding Video 1 💕',
        likes: 1234,
        comments: 56,
        shares: 12,
        views: 5000,
        duration: 30,
        createdAt: new Date().toISOString(),
        creatorId: 'creator1',
        tags: ['wedding', 'romance'],
        isPublic: true
      },
      {
        id: '755f7bdc-2026-4037-b15d-469397e29010',
        src: 'https://vz-97606b97-31d.b-cdn.net/755f7bdc-2026-4037-b15d-469397e29010/playlist.m3u8',
        username: 'synthetikmedia',
        description: 'Romantic Moments 💍',
        likes: 5678,
        comments: 234,
        shares: 89,
        views: 12000,
        duration: 45,
        createdAt: new Date().toISOString(),
        creatorId: 'creator1',
        tags: ['romance', 'moments'],
        isPublic: true
      },
      {
        id: '533f6ad4-cf07-4846-b232-c7f79dce11a5',
        src: 'https://vz-97606b97-31d.b-cdn.net/533f6ad4-cf07-4846-b232-c7f79dce11a5/playlist.m3u8',
        username: 'synthetikmedia',
        description: 'Wedding Celebration 🎊',
        likes: 9012,
        comments: 345,
        shares: 123,
        views: 18000,
        duration: 60,
        createdAt: new Date().toISOString(),
        creatorId: 'creator1',
        tags: ['wedding', 'celebration'],
        isPublic: true
      },
      {
        id: 'ab57b1fe-df73-4bcc-8f57-b7869519b62d',
        src: 'https://vz-97606b97-31d.b-cdn.net/ab57b1fe-df73-4bcc-8f57-b7869519b62d/playlist.m3u8',
        username: 'synthetikmedia',
        description: 'Love Story 💖',
        likes: 3456,
        comments: 123,
        shares: 45,
        views: 8500,
        duration: 35,
        createdAt: new Date().toISOString(),
        creatorId: 'creator1',
        tags: ['love', 'story'],
        isPublic: true
      },
      {
        id: '67254311-41da-4200-a59c-429995a0755f',
        src: 'https://vz-97606b97-31d.b-cdn.net/67254311-41da-4200-a59c-429995a0755f/playlist.m3u8',
        username: 'synthetikmedia',
        description: 'Forever Together 👰🤵',
        likes: 7890,
        comments: 456,
        shares: 234,
        views: 15000,
        duration: 50,
        createdAt: new Date().toISOString(),
        creatorId: 'creator1',
        tags: ['wedding', 'forever'],
        isPublic: true
      }
    ]
  }

  /**
   * Upload video for creators
   */
  async uploadVideo(upload: VideoUpload): Promise<Video> {
    // TODO: Implement via backend API
    console.log('VideoService.uploadVideo - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Get video performance analytics
   */
  async getVideoMetadata(videoId: string): Promise<VideoPerformance> {
    // TODO: Implement via backend API
    console.log('VideoService.getVideoMetadata - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Update video metadata
   */
  async updateVideoMetadata(videoId: string, metadata: Partial<VideoMetadata>): Promise<Video> {
    // TODO: Implement via backend API
    console.log('VideoService.updateVideoMetadata - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('VideoService.deleteVideo - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Get all videos by creator
   */
  async getCreatorVideos(creatorId: string, filters?: VideoFilters): Promise<Video[]> {
    // TODO: Implement via backend API
    console.log('VideoService.getCreatorVideos - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(filters?: VideoFilters): Promise<Video[]> {
    // TODO: Implement via backend API
    console.log('VideoService.getTrendingVideos - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Search videos
   */
  async searchVideos(query: string, filters?: VideoFilters): Promise<Video[]> {
    // TODO: Implement via backend API
    console.log('VideoService.searchVideos - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Get video by ID
   */
  async getVideoById(videoId: string): Promise<Video | null> {
    // TODO: Implement via backend API
    console.log('VideoService.getVideoById - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Get video comments
   */
  async getVideoComments(videoId: string): Promise<Comment[]> {
    // TODO: Implement via backend API
    console.log('VideoService.getVideoComments - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }

  /**
   * Add comment to video
   */
  async addComment(videoId: string, userId: string, content: string): Promise<Comment> {
    // TODO: Implement via backend API
    console.log('VideoService.addComment - To be implemented by backend')
    throw new Error('VideoService not implemented - backend integration required')
  }
}

export interface Comment {
  id: string
  videoId: string
  userId: string
  username: string
  content: string
  createdAt: string
  likes: number
}

// Singleton instance for use across the application
export const videoService = new VideoService()