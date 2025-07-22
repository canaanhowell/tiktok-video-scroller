import { NextRequest, NextResponse } from 'next/server';
import { getCollection, buildVideoQuery, docToObject } from '@/lib/firebase/admin';
import type { Video, Vendor, VideoSearchFilters, ApiResponse } from '@/types/firebase';
import { isFirebaseError } from '@/types/firebase';

interface VideoWithVendor extends Video {
  vendor?: Vendor;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters with proper typing
    const filters: VideoSearchFilters = {
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      zipcode: searchParams.get('zipcode') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
    };
    
    // Get videos collection and build query
    const videosCollection = getCollection('videos');
    const videosQuery = buildVideoQuery(videosCollection, filters);
    
    // Execute query
    const videosSnapshot = await videosQuery.get();
    const videoData: Video[] = [];
    
    // Collect unique vendor IDs
    const vendorIds = new Set<string>();
    
    videosSnapshot.forEach((doc) => {
      const video = docToObject<Video>(doc);
      videoData.push(video);
      if (video.vendorId) {
        vendorIds.add(video.vendorId);
      }
    });
    
    // Fetch all vendors in one batch
    const vendors = new Map<string, Vendor>();
    if (vendorIds.size > 0) {
      const vendorsCollection = getCollection('vendors');
      const vendorPromises = Array.from(vendorIds).map(id => 
        vendorsCollection.doc(id).get()
      );
      
      const vendorDocs = await Promise.all(vendorPromises);
      vendorDocs.forEach(doc => {
        if (doc.exists) {
          vendors.set(doc.id, docToObject<Vendor>(doc));
        }
      });
    }
    
    // Combine videos with vendor data
    const videosWithVendors: VideoWithVendor[] = videoData.map(video => ({
      ...video,
      vendor: video.vendorId ? vendors.get(video.vendorId) : undefined
    }));
    
    const response: ApiResponse<VideoWithVendor[]> = {
      success: true,
      data: videosWithVendors,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Videos with vendors error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = isFirebaseError(error) ? error.code : undefined;
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch videos with vendors',
      details: {
        message: errorMessage,
        code: errorCode
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}