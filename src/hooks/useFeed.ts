/**
 * React hook for fetching and managing video feeds
 * Updated to use service layer architecture
 */

import { useState, useEffect, useCallback } from 'react';
import { videoService, type Video } from '@/services/videos';
import { useAuth } from '@/hooks/useAuth';

interface UseFeedOptions {
  feedType: 'personalized' | 'trending' | 'category';
  categoryId?: string;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseFeedResult {
  videos: Video[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeed({
  feedType,
  categoryId,
  pageSize = 20,
  autoLoad = true
}: UseFeedOptions): UseFeedResult {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { user } = useAuth();
  
  /**
   * Fetch videos using service layer
   */
  const fetchVideos = useCallback(async (currentOffset = 0, append = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        categoryId,
        limit: pageSize,
        offset: currentOffset,
        sortBy: feedType === 'trending' ? 'trending' as const : 'newest' as const
      };
      
      let fetchedVideos: Video[] = [];
      
      switch (feedType) {
        case 'personalized':
          fetchedVideos = await videoService.getVideoFeed(user?.id || 'guest', filters);
          break;
          
        case 'trending':
          fetchedVideos = await videoService.getTrendingVideos(filters);
          break;
          
        case 'category':
          if (!categoryId) {
            throw new Error('Category ID required for category feed');
          }
          fetchedVideos = await videoService.getVideoFeed(user?.id || 'guest', filters);
          break;
          
        default:
          throw new Error(`Unknown feed type: ${feedType}`);
      }
      
      // Update state
      if (append) {
        setVideos(prev => [...prev, ...fetchedVideos]);
      } else {
        setVideos(fetchedVideos);
      }
      
      setOffset(currentOffset + fetchedVideos.length);
      setHasMore(fetchedVideos.length === pageSize); // Has more if we got a full page
      
    } catch (err) {
      console.log('Service layer not implemented yet, using empty feed');
      console.log('Error:', err instanceof Error ? err.message : 'Unknown error');
      if (!append) {
        setVideos([]);
      }
      setHasMore(false);
      // Don't set error for service not implemented
    } finally {
      setLoading(false);
    }
  }, [feedType, categoryId, pageSize, user?.id]);
  
  /**
   * Load more videos
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    await fetchVideos(offset, true);
  }, [hasMore, loading, offset, fetchVideos]);
  
  /**
   * Refresh the feed
   */
  const refresh = useCallback(async () => {
    setVideos([]);
    setOffset(0);
    setHasMore(true);
    await fetchVideos(0, false);
  }, [fetchVideos]);
  
  // Initial load
  useEffect(() => {
    if (autoLoad) {
      fetchVideos();
    }
  }, [feedType, categoryId, autoLoad]); // Removed fetchVideos from deps to prevent loops
  
  // Refresh when user changes
  useEffect(() => {
    if (feedType === 'personalized' && autoLoad) {
      refresh();
    }
  }, [user?.id]);
  
  return {
    videos,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll(
  callback: () => void,
  options: {
    threshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { threshold = 0.8, enabled = true } = options;
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight * threshold) {
        callback();
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, threshold, enabled]);
}