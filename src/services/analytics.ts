/**
 * Analytics Service Layer
 * Abstract interface for analytics and tracking operations
 * Separates frontend from backend analytics implementation
 */

export interface ViewData {
  startTime: number
  endTime?: number
  watchDuration: number
  deviceType: 'mobile' | 'desktop' | 'tablet'
  location?: {
    country: string
    region: string
  }
}

export interface InteractionData {
  type: 'like' | 'save' | 'share' | 'comment' | 'follow'
  timestamp: number
  metadata?: Record<string, any>
}

export interface ViewingHistory {
  videoId: string
  viewedAt: string
  watchDuration: number
  completed: boolean
}

export interface VideoAnalytics {
  videoId: string
  totalViews: number
  uniqueViews: number
  averageWatchTime: number
  completionRate: number
  likes: number
  comments: number
  shares: number
  engagement: number
  demographics: {
    ageGroups: Record<string, number>
    genders: Record<string, number>
    locations: Record<string, number>
  }
  timeSeriesData: {
    date: string
    views: number
    engagement: number
  }[]
}

export interface CategoryPerformance {
  categoryId: string
  categoryName: string
  totalVideos: number
  totalViews: number
  averageEngagement: number
  topPerformingVideos: string[]
  trendDirection: 'up' | 'down' | 'stable'
}

export interface AnalyticsReport {
  userId: string
  timeframe: string
  totalViews: number
  totalWatchTime: number
  averageSessionDuration: number
  topCategories: string[]
  engagementTrends: {
    date: string
    engagement: number
  }[]
  userGrowth?: {
    date: string
    followers: number
  }[]
}

/**
 * Analytics Service Class
 * To be implemented by backend team with their chosen technology
 */
export class AnalyticsService {

  /**
   * Track video view event
   */
  async trackVideoView(userId: string, videoId: string, viewData: ViewData): Promise<void> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.trackVideoView - To be implemented by backend', {
      userId,
      videoId,
      viewData
    })
    // For now, just log the event
  }

  /**
   * Track video interaction (like, save, share, etc.)
   */
  async trackVideoInteraction(userId: string, videoId: string, interaction: InteractionData): Promise<void> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.trackVideoInteraction - To be implemented by backend', {
      userId,
      videoId,
      interaction
    })
    // For now, just log the event
  }

  /**
   * Get user's viewing history
   */
  async getViewingHistory(userId: string, limit?: number): Promise<ViewingHistory[]> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.getViewingHistory - To be implemented by backend')
    throw new Error('AnalyticsService not implemented - backend integration required')
  }

  /**
   * Get video performance analytics
   */
  async getVideoPerformance(videoId: string): Promise<VideoAnalytics> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.getVideoPerformance - To be implemented by backend')
    throw new Error('AnalyticsService not implemented - backend integration required')
  }

  /**
   * Get category performance for creator
   */
  async getCategoryPerformance(creatorId: string): Promise<CategoryPerformance[]> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.getCategoryPerformance - To be implemented by backend')
    throw new Error('AnalyticsService not implemented - backend integration required')
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(userId: string, timeframe: 'week' | 'month' | 'year'): Promise<AnalyticsReport> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.generateAnalyticsReport - To be implemented by backend')
    throw new Error('AnalyticsService not implemented - backend integration required')
  }

  /**
   * Track user session
   */
  async trackSession(userId: string, sessionData: {
    startTime: number
    endTime?: number
    deviceType: string
    userAgent: string
  }): Promise<void> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.trackSession - To be implemented by backend')
    // For now, just log the event
  }

  /**
   * Track page view
   */
  async trackPageView(userId: string, page: string, metadata?: Record<string, any>): Promise<void> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.trackPageView - To be implemented by backend', {
      userId,
      page,
      metadata
    })
    // For now, just log the event
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(userId: string): Promise<{
    activeUsers: number
    currentViews: number
    trending: string[]
  }> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.getRealTimeAnalytics - To be implemented by backend')
    throw new Error('AnalyticsService not implemented - backend integration required')
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(userId: string, timeframe: string, format: 'csv' | 'json'): Promise<Blob> {
    // TODO: Implement via backend API
    console.log('AnalyticsService.exportAnalytics - To be implemented by backend')
    throw new Error('AnalyticsService not implemented - backend integration required')
  }
}

// Singleton instance for use across the application
export const analyticsService = new AnalyticsService()