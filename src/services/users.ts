/**
 * User Service Layer
 * Abstract interface for user operations
 * Separates frontend from backend user management implementation
 */

export interface UserProfile {
  id: string
  email: string
  name: string
  username: string
  userType: 'consumer' | 'creator'
  profileImage?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    youtube?: string
  }
  preferences: UserPreferences
  stats: UserStats
  createdAt: string
  lastLoginAt: string
}

export interface UserPreferences {
  categories: string[]
  language: string
  notifications: {
    email: boolean
    push: boolean
    newVideos: boolean
    likes: boolean
    comments: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showViewingHistory: boolean
    allowDirectMessages: boolean
  }
  playback: {
    autoplay: boolean
    quality: 'auto' | 'low' | 'medium' | 'high'
    volume: number
  }
}

export interface UserStats {
  followersCount: number
  followingCount: number
  videosCount: number
  totalViews: number
  totalLikes: number
}

export interface SavedVideo {
  id: string
  videoId: string
  userId: string
  savedAt: string
  video: {
    id: string
    title: string
    thumbnail: string
    creator: string
    duration: number
  }
}

export interface FollowData {
  id: string
  followerId: string
  followingId: string
  followedAt: string
  follower?: UserProfile
  following?: UserProfile
}

export interface SubscriptionData {
  id: string
  userId: string
  plan: 'free' | 'premium' | 'creator'
  status: 'active' | 'inactive' | 'cancelled'
  startDate: string
  endDate?: string
  features: string[]
  billing: {
    amount: number
    currency: string
    interval: 'monthly' | 'yearly'
    nextBilling?: string
  }
}

/**
 * User Service Class
 * To be implemented by backend team with their chosen technology
 */
export class UserService {

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    // TODO: Implement via backend API
    console.log('UserService.getUserProfile - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    // TODO: Implement via backend API
    console.log('UserService.updateUserProfile - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Get user's saved videos
   */
  async getSavedVideos(userId: string, limit?: number, offset?: number): Promise<SavedVideo[]> {
    // TODO: Implement via backend API
    console.log('UserService.getSavedVideos - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Save video to user's collection
   */
  async saveVideo(userId: string, videoId: string): Promise<SavedVideo> {
    // TODO: Implement via backend API
    console.log('UserService.saveVideo - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Remove video from saved collection
   */
  async unsaveVideo(userId: string, videoId: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('UserService.unsaveVideo - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Check if video is saved by user
   */
  async isVideoSaved(userId: string, videoId: string): Promise<boolean> {
    // TODO: Implement via backend API
    console.log('UserService.isVideoSaved - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Follow a creator
   */
  async followCreator(userId: string, creatorId: string): Promise<FollowData> {
    // TODO: Implement via backend API
    console.log('UserService.followCreator - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Unfollow a creator
   */
  async unfollowCreator(userId: string, creatorId: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('UserService.unfollowCreator - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Check if user is following creator
   */
  async isFollowing(userId: string, creatorId: string): Promise<boolean> {
    // TODO: Implement via backend API
    console.log('UserService.isFollowing - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit?: number, offset?: number): Promise<FollowData[]> {
    // TODO: Implement via backend API
    console.log('UserService.getFollowers - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Get users that user is following
   */
  async getFollowing(userId: string, limit?: number, offset?: number): Promise<FollowData[]> {
    // TODO: Implement via backend API
    console.log('UserService.getFollowing - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Get user's subscription data
   */
  async getSubscriptionData(userId: string): Promise<SubscriptionData | null> {
    // TODO: Implement via backend API
    console.log('UserService.getSubscriptionData - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Update user subscription
   */
  async updateSubscription(userId: string, subscriptionData: Partial<SubscriptionData>): Promise<SubscriptionData> {
    // TODO: Implement via backend API
    console.log('UserService.updateSubscription - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('UserService.cancelSubscription - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    // TODO: Implement via backend API
    console.log('UserService.updatePreferences - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Search users
   */
  async searchUsers(query: string, userType?: 'consumer' | 'creator', limit?: number): Promise<UserProfile[]> {
    // TODO: Implement via backend API
    console.log('UserService.searchUsers - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Get recommended creators for user
   */
  async getRecommendedCreators(userId: string, limit?: number): Promise<UserProfile[]> {
    // TODO: Implement via backend API
    console.log('UserService.getRecommendedCreators - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Block/unblock user
   */
  async blockUser(userId: string, targetUserId: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('UserService.blockUser - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('UserService.unblockUser - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }

  /**
   * Report user
   */
  async reportUser(userId: string, targetUserId: string, reason: string, details?: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('UserService.reportUser - To be implemented by backend')
    throw new Error('UserService not implemented - backend integration required')
  }
}

// Singleton instance for use across the application
export const userService = new UserService()