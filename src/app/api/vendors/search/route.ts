import { NextRequest, NextResponse } from 'next/server';
import { getCollection, buildVendorQuery, docToObject, type FirestoreQuery } from '@/lib/firebase/admin';
import { getZipCodeMapper } from '@/utils/zipcodeMapper';
import type { Vendor, VendorSearchFilters, PaginatedResponse } from '@/types/firebase';
import { isFirebaseError } from '@/types/firebase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zipMapper = getZipCodeMapper();
    
    // Extract search parameters with proper typing
    const filters: VendorSearchFilters = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      zipcode: searchParams.get('zipcode') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };
    
    // Get vendors collection
    const vendorsCollection = getCollection('vendors');
    
    // Build query with special handling for ZIP codes
    let query: FirestoreQuery;
    
    if (filters.zipcode) {
      const city = zipMapper.getCityForZip(filters.zipcode);
      if (city) {
        const areaZips = zipMapper.getAllZipsForCity(city);
        // Firestore 'in' queries are limited to 10 items
        const limitedZips = areaZips.slice(0, 10);
        
        // Create a modified filter object for the query builder
        const modifiedFilters = { ...filters };
        delete modifiedFilters.zipcode;
        
        query = buildVendorQuery(vendorsCollection, modifiedFilters);
        query = query.where('zipcode', 'in', limitedZips);
      } else {
        // Normal query building
        query = buildVendorQuery(vendorsCollection, filters);
      }
    } else {
      // Normal query building
      query = buildVendorQuery(vendorsCollection, filters);
    }
    
    // Execute query
    const snapshot = await query.get();
    const vendors: Vendor[] = [];
    
    snapshot.forEach((doc) => {
      vendors.push(docToObject<Vendor>(doc));
    });
    
    // Filter by text search if provided (Firestore doesn't have full-text search)
    let filteredVendors = vendors;
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase();
      filteredVendors = vendors.filter(vendor => 
        vendor.name?.toLowerCase().includes(searchTerm) ||
        vendor.description?.toLowerCase().includes(searchTerm) ||
        vendor.category?.toLowerCase().includes(searchTerm) ||
        vendor.services?.some(service => service.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by rating
    filteredVendors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // Paginate results
    const startIndex = ((filters.page || 1) - 1) * (filters.limit || 20);
    const endIndex = startIndex + (filters.limit || 20);
    const paginatedVendors = filteredVendors.slice(startIndex, endIndex);
    
    const response: PaginatedResponse<Vendor> = {
      hits: paginatedVendors,
      found: filteredVendors.length,
      page: filters.page || 1,
      totalPages: Math.ceil(filteredVendors.length / (filters.limit || 20)),
      limit: filters.limit || 20
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Vendor search error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = isFirebaseError(error) ? error.code : undefined;
    
    return NextResponse.json(
      { 
        error: 'Failed to search vendors', 
        details: errorMessage,
        code: errorCode 
      },
      { status: 500 }
    );
  }
}