import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/firebase/admin';
import type { ApiResponse } from '@/types/firebase';
import { isFirebaseError } from '@/types/firebase';

interface VendorStats {
  total: number;
  timestamp: string;
}

export async function GET() {
  try {
    const vendorsCollection = getCollection('vendors');
    const snapshot = await vendorsCollection.get();
    
    const stats: VendorStats = {
      total: snapshot.size,
      timestamp: new Date().toISOString()
    };
    
    const response: ApiResponse<VendorStats> = {
      success: true,
      data: stats,
      timestamp: stats.timestamp
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Vendor stats error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = isFirebaseError(error) ? error.code : undefined;
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to get vendor stats',
      details: {
        message: errorMessage,
        code: errorCode
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}