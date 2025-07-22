// Firebase vendor service - replaces search_app vendor functionality
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  type DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getZipCodeMapper } from '@/utils/zipcodeMapper';

export interface FirebaseVendor {
  id: string;
  businessName: string;
  category: string;
  city: string;
  zipcode: string;
  contact: {
    website?: string;
    phone?: string;
    email?: string;
  };
  rating: number;
  tags: string[];
  videoCount: number;
  createdAt: any;
}

export interface VendorSearchFilters {
  q?: string;           // Text search query
  category?: string;    // Category filter
  city?: string;        // City filter
  zipcode?: string;     // Single ZIP code
  zipcodes?: string[];  // Multiple ZIP codes for area search
  page?: number;
  limit?: number;
}

export interface SearchResults<T> {
  hits: T[];
  found: number;
  page: number;
  totalPages: number;
}

export class FirebaseVendorService {
  private zipMapper = getZipCodeMapper();

  async searchVendors(filters: VendorSearchFilters): Promise<SearchResults<FirebaseVendor>> {
    if (!db) {
      console.error('Firebase not initialized');
      return { hits: [], found: 0, page: 1, totalPages: 0 };
    }
    
    const vendorsRef = collection(db, 'vendors');
    let q = query(vendorsRef);

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.city) {
      q = query(q, where('city', '==', filters.city));
    }

    if (filters.zipcode) {
      // For single ZIP code, get all ZIP codes for the area
      const city = this.zipMapper.getCityForZip(filters.zipcode);
      if (city) {
        const areaZips = this.zipMapper.getAllZipsForCity(city);
        q = query(q, where('zipcode', 'in', areaZips));
      } else {
        q = query(q, where('zipcode', '==', filters.zipcode));
      }
    }

    if (filters.zipcodes && filters.zipcodes.length > 0) {
      // Firestore 'in' queries are limited to 10 items
      const zipBatches = this.chunkArray(filters.zipcodes, 10);
      const results: FirebaseVendor[] = [];
      
      for (const zipBatch of zipBatches) {
        const batchQuery = query(q, where('zipcode', 'in', zipBatch));
        const snapshot = await getDocs(batchQuery);
        
        snapshot.docs.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() } as FirebaseVendor);
        });
      }
      
      return this.formatResults(results, filters);
    }

    // Add ordering and limits
    q = query(q, orderBy('rating', 'desc'));
    
    const pageLimit = filters.limit || 20;
    q = query(q, limit(pageLimit));

    const snapshot = await getDocs(q);
    const vendors: FirebaseVendor[] = [];

    snapshot.docs.forEach(doc => {
      vendors.push({ id: doc.id, ...doc.data() } as FirebaseVendor);
    });

    // Filter by text search if provided (Firebase doesn't have full-text search built-in)
    let filteredVendors = vendors;
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase();
      filteredVendors = vendors.filter(vendor => 
        vendor.businessName.toLowerCase().includes(searchTerm) ||
        vendor.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return this.formatResults(filteredVendors, filters);
  }

  async searchVendorsByZipArea(zipCodes: string[]): Promise<SearchResults<FirebaseVendor>> {
    return this.searchVendors({ zipcodes: zipCodes });
  }

  async getVendorStats() {
    if (!db) {
      return { total: 0, timestamp: new Date().toISOString() };
    }
    
    const vendorsRef = collection(db, 'vendors');
    const snapshot = await getDocs(vendorsRef);
    
    return {
      total: snapshot.size,
      timestamp: new Date().toISOString()
    };
  }

  private formatResults(vendors: FirebaseVendor[], filters: VendorSearchFilters): SearchResults<FirebaseVendor> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedVendors = vendors.slice(startIndex, endIndex);

    return {
      hits: paginatedVendors,
      found: vendors.length,
      page,
      totalPages: Math.ceil(vendors.length / limit)
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

}