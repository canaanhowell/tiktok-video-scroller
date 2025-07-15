import axios from 'axios'
import { bunnyClient, bunnyConfig } from './client'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface VideoUploadResult {
  videoId: string
  videoUrl: string
  thumbnailUrl: string
  processingStatus: string
}

export class BunnyVideoUploader {
  /**
   * Upload a video file to Bunny CDN Stream
   */
  static async uploadVideo(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VideoUploadResult> {
    try {
      // Step 1: Create video object in Bunny Stream
      const videoTitle = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      const createResponse = await bunnyClient.stream.post('/videos', {
        title: videoTitle,
        collectionId: null // You can organize videos into collections if needed
      })
      
      const videoId = createResponse.data.guid
      console.log('Created video object:', videoId)
      
      // Step 2: Upload the actual video file
      const uploadUrl = `https://video.bunnycdn.com/library/${bunnyConfig.streamingLibrary}/videos/${videoId}`
      
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResponse = await axios.put(uploadUrl, file, {
        headers: {
          'AccessKey': process.env.bunny_cdn_streaming_key!,
          'Content-Type': file.type || 'video/mp4'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }
            onProgress(progress)
          }
        }
      })
      
      console.log('Video uploaded successfully:', videoId)
      
      // Step 3: Get video details to check processing status
      const videoDetails = await this.getVideoDetails(videoId)
      
      return {
        videoId,
        videoUrl: bunnyConfig.getVideoUrl(videoId),
        thumbnailUrl: bunnyConfig.getThumbnailUrl(videoId),
        processingStatus: videoDetails.status
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      throw new Error(`Failed to upload video: ${error.message}`)
    }
  }
  
  /**
   * Get video details and processing status
   */
  static async getVideoDetails(videoId: string) {
    try {
      const response = await bunnyClient.stream.get(`/videos/${videoId}`)
      return response.data
    } catch (error) {
      console.error('Error getting video details:', error)
      throw error
    }
  }
  
  /**
   * Check if video is ready for playback
   */
  static async isVideoReady(videoId: string): Promise<boolean> {
    try {
      const details = await this.getVideoDetails(videoId)
      // Status 4 means the video is fully processed and ready
      return details.status === 4
    } catch (error) {
      return false
    }
  }
  
  /**
   * Delete a video from Bunny CDN
   */
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      await bunnyClient.stream.delete(`/videos/${videoId}`)
      console.log('Video deleted:', videoId)
    } catch (error) {
      console.error('Error deleting video:', error)
      throw error
    }
  }
  
  /**
   * Upload video from URL (useful for importing from other sources)
   */
  static async uploadFromUrl(
    videoUrl: string,
    title: string
  ): Promise<VideoUploadResult> {
    try {
      const response = await bunnyClient.stream.post('/videos/fetch', {
        url: videoUrl,
        title: title,
        collectionId: null
      })
      
      const videoId = response.data.guid
      
      return {
        videoId,
        videoUrl: bunnyConfig.getVideoUrl(videoId),
        thumbnailUrl: bunnyConfig.getThumbnailUrl(videoId),
        processingStatus: response.data.status
      }
    } catch (error) {
      console.error('Error uploading video from URL:', error)
      throw new Error(`Failed to upload video from URL: ${error.message}`)
    }
  }
}