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
    
    // Temporary mock data for development
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