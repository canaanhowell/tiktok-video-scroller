import { NextRequest, NextResponse } from 'next/server';
import { getCollection, buildVideoQuery, docToObject } from '@/lib/firebase/admin';
import type { Video, VideoSearchFilters, ApiResponse } from '@/types/firebase';
import { isFirebaseError } from '@/types/firebase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build filters with proper typing
    const filters: VideoSearchFilters = {
      category: searchParams.get('category') || undefined,
      vendorId: searchParams.get('vendorId') || undefined,
      city: searchParams.get('city') || undefined,
      zipcode: searchParams.get('zipcode') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };
    
    // Get videos collection and build query
    const videosCollection = getCollection('videos');
    const query = buildVideoQuery(videosCollection, filters);
    
    // Execute query
    const snapshot = await query.get();
    const videos: Video[] = [];
    
    snapshot.forEach((doc) => {
      videos.push(docToObject<Video>(doc));
    });
    
    const response: ApiResponse<Video[]> = {
      success: true,
      data: videos,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Videos fetch error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = isFirebaseError(error) ? error.code : undefined;
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch videos',
      details: {
        message: errorMessage,
        code: errorCode
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}