/**
 * React hook for video analytics tracking
 * Updated to use service layer architecture
 */

import { useEffect, useRef, useCallback } from 'react';
import { analyticsService } from '@/services/analytics';
import { useAuth } from '@/contexts/AuthContext';

interface UseAnalyticsOptions {
  video_id: string;
  video_duration?: number;
  isActive?: boolean;
}

export function useAnalytics({ video_id, video_duration, isActive = false }: UseAnalyticsOptions) {
  const { user } = useAuth();
  const hasTrackedView = useRef(false);
  const watchStartTime = useRef<number>(0);
  
  // Track video view when it becomes active
  useEffect(() => {
    if (isActive && !hasTrackedView.current && user?.id) {
      watchStartTime.current = Date.now();
      
      const viewData = {
        startTime: watchStartTime.current,
        watchDuration: 0,
        deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' as const : 'desktop' as const
      };
      
      analyticsService.trackVideoView(user.id, video_id, viewData);
      hasTrackedView.current = true;
    }
    
    // End watch session when video becomes inactive
    if (!isActive && hasTrackedView.current && user?.id) {
      const watchDuration = Date.now() - watchStartTime.current;
      
      const viewData = {
        startTime: watchStartTime.current,
        endTime: Date.now(),
        watchDuration,
        deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' as const : 'desktop' as const
      };
      
      analyticsService.trackVideoView(user.id, video_id, viewData);
      hasTrackedView.current = false;
    }
    
    // Cleanup on unmount
    return () => {
      if (hasTrackedView.current && user?.id) {
        const watchDuration = Date.now() - watchStartTime.current;
        
        const viewData = {
          startTime: watchStartTime.current,
          endTime: Date.now(),
          watchDuration,
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' as const : 'desktop' as const
        };
        
        analyticsService.trackVideoView(user.id, video_id, viewData);
      }
    };
  }, [isActive, video_id, video_duration, user?.id]);
  
  // Track interactions
  const trackInteraction = useCallback((
    interactionType: 'like' | 'save' | 'share' | 'comment' | 'follow',
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;
    
    const interactionData = {
      type: interactionType,
      timestamp: Date.now(),
      metadata
    };
    
    analyticsService.trackVideoInteraction(user.id, video_id, interactionData);
  }, [video_id, user?.id]);
  
  // Track like/unlike
  const trackLike = useCallback((liked: boolean) => {
    trackInteraction(liked ? 'like' : 'like', { action: liked ? 'add' : 'remove' });
  }, [trackInteraction]);
  
  // Track share
  const trackShare = useCallback(() => {
    trackInteraction('share');
  }, [trackInteraction]);
  
  // Track save
  const trackSave = useCallback((saved: boolean) => {
    trackInteraction('save', { action: saved ? 'add' : 'remove' });
  }, [trackInteraction]);
  
  // Track comment
  const trackComment = useCallback(() => {
    trackInteraction('comment');
  }, [trackInteraction]);
  
  // Track follow
  const trackFollow = useCallback((followed: boolean) => {
    trackInteraction('follow', { action: followed ? 'add' : 'remove' });
  }, [trackInteraction]);
  
  return {
    trackLike,
    trackShare,
    trackSave,
    trackComment,
    trackFollow,
    trackInteraction
  };
}

/**
 * Hook to track session-level analytics
 */
export function useSessionAnalytics() {
  const { user } = useAuth();
  const sessionStartTime = useRef<number>(Date.now());
  
  // Track session on mount and cleanup
  useEffect(() => {
    if (user?.id) {
      const sessionData = {
        startTime: sessionStartTime.current,
        deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        userAgent: navigator.userAgent
      };
      
      analyticsService.trackSession(user.id, sessionData);
    }
    
    return () => {
      if (user?.id) {
        const sessionData = {
          startTime: sessionStartTime.current,
          endTime: Date.now(),
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          userAgent: navigator.userAgent
        };
        
        analyticsService.trackSession(user.id, sessionData);
      }
    };
  }, [user?.id]);
  
  return {
    sessionStartTime: sessionStartTime.current
  };
}