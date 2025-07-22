/**
 * Search Service Integration
 * Connects web_app to search_app backend for vendor and video search
 */

import { BACKEND_CONFIG } from '../config/backend'

// Types matching our backend schema
export interface Vendor {
  id: string
  businessName: string
  email: string
  domain?: string
  category: string
  city: string
  state: string
  zipcode?: string
  active: boolean
  tags: string[]
  videoCount: number
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface SearchableVideo {
  id: string
  title: string
  filename: string
  vendorId: string
  category: string
  city: string
  state: string
  zipcode?: string
  tags: string[]
  bunnyVideoId?: string
  bunnyUrl?: string
  uploadStatus: string
  createdAt: string
}

export interface SearchFilters {
  q?: string           // Search query
  category?: string    // Filter by category
  city?: string        // Filter by city
  state?: string       // Filter by state
  zipcode?: string     // Filter by ZIP code
  zipcodes?: string[]  // Filter by multiple ZIP codes (for area search)
  page?: number        // Page number
  limit?: number       // Results per page
  sortBy?: string      // Sort field
}

export interface SearchResults<T> {
  results: T[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
}

export interface AutocompleteResult {
  suggestions: string[]
}

export interface FacetCounts {
  [field: string]: {
    [value: string]: number
  }
}

export class SearchService {
  private baseUrl: string
  
  constructor() {
    this.baseUrl = BACKEND_CONFIG.search.baseUrl || 'http://localhost:3002'
  }

  /**
   * Search vendors with filtering
   */
  async searchVendors(filters: SearchFilters = {}): Promise<SearchResults<Vendor>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (filters.q) searchParams.append('q', filters.q)
      if (filters.category) searchParams.append('category', filters.category)
      if (filters.city) searchParams.append('city', filters.city)
      if (filters.state) searchParams.append('state', filters.state)
      if (filters.zipcode) searchParams.append('zipcode', filters.zipcode)
      if (filters.zipcodes) {
        // For area search, pass multiple ZIP codes
        filters.zipcodes.forEach(zip => searchParams.append('zipcode', zip))
      }
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy)

      const response = await fetch(`${this.baseUrl}/search/vendors?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        results: data.hits || [],
        totalCount: data.found || 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        hasMore: data.page * data.limit < data.found
      }
    } catch (error) {
      console.error('Error searching vendors:', error)
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        hasMore: false
      }
    }
  }

  /**
   * Search videos with filtering
   */
  async searchVideos(filters: SearchFilters = {}): Promise<SearchResults<SearchableVideo>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (filters.q) searchParams.append('q', filters.q)
      if (filters.category) searchParams.append('category', filters.category)
      if (filters.city) searchParams.append('city', filters.city)
      if (filters.zipcode) searchParams.append('zipcode', filters.zipcode)
      if (filters.zipcodes) {
        filters.zipcodes.forEach(zip => searchParams.append('zipcode', zip))
      }
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())

      const response = await fetch(`${this.baseUrl}/search/videos?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Video search failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        results: data.hits || [],
        totalCount: data.found || 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        hasMore: data.page * data.limit < data.found
      }
    } catch (error) {
      console.error('Error searching videos:', error)
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        hasMore: false
      }
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocomplete(query: string, limit: number = 5): Promise<AutocompleteResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`
      )
      
      if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.status}`)
      }

      const data = await response.json()
      return { suggestions: data.suggestions || [] }
    } catch (error) {
      console.error('Error getting autocomplete:', error)
      return { suggestions: [] }
    }
  }

  /**
   * Get facet counts for filtering
   */
  async getVendorFacets(fields: string[] = ['category', 'city', 'state']): Promise<FacetCounts> {
    try {
      const fieldsParam = fields.join(',')
      const response = await fetch(`${this.baseUrl}/search/facets/vendors?fields=${fieldsParam}`)
      
      if (!response.ok) {
        throw new Error(`Facets request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting facets:', error)
      return {}
    }
  }

  /**
   * Search vendors by ZIP code area (smart geographic search)
   */
  async searchVendorsByZipArea(zipCodes: string[], category?: string): Promise<SearchResults<Vendor>> {
    return this.searchVendors({
      zipcodes: zipCodes,
      category,
      limit: 50, // Get more results for area search
      sortBy: 'rating' // Sort by rating for area searches
    })
  }

  /**
   * Get vendor videos for a specific vendor
   */
  async getVendorVideos(vendorId: string): Promise<SearchResults<SearchableVideo>> {
    return this.searchVideos({
      q: `vendorId:${vendorId}`,
      limit: 100 // Get all videos for this vendor
    })
  }

  /**
   * Get trending vendors in a city
   */
  async getTrendingVendors(city: string, category?: string, limit: number = 10): Promise<SearchResults<Vendor>> {
    return this.searchVendors({
      city,
      category,
      limit,
      sortBy: 'rating'
    })
  }

  /**
   * Search by category and location
   */
  async searchByCategory(category: string, city?: string, zipCodes?: string[]): Promise<SearchResults<Vendor>> {
    const filters: SearchFilters = {
      category,
      limit: 20,
      sortBy: 'rating'
    }

    if (zipCodes && zipCodes.length > 0) {
      filters.zipcodes = zipCodes
    } else if (city) {
      filters.city = city
    }

    return this.searchVendors(filters)
  }
}

// Export singleton instance
export const searchService = new SearchService()