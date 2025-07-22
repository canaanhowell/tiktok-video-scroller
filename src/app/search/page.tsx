'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { searchService, type Vendor, type SearchFilters } from '../../services/search'
import { ZipCodeFilter } from '../../components/ZipCodeFilter'

export default function SearchPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [filterZips, setFilterZips] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)

  // Available categories - these would typically come from the backend
  const categories = [
    'venues',
    'photographers', 
    'videographers',
    'musicians',
    'djs',
    'florists',
    'bands'
  ]

  const performSearch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const filters: SearchFilters = {
        limit: 20
      }

      // Add search query if present
      if (searchQuery.trim()) {
        filters.q = searchQuery.trim()
      }

      // Add category filter if selected
      if (selectedCategory) {
        filters.category = selectedCategory
      }

      // Add ZIP code filtering if location is selected
      if (filterZips.length > 0) {
        filters.zipcodes = filterZips
      } else if (selectedCity) {
        filters.city = selectedCity
      }

      const results = await searchService.searchVendors(filters)
      setVendors(results.results)
      setTotalCount(results.totalCount)

      console.log('Search results:', {
        query: searchQuery,
        category: selectedCategory,
        city: selectedCity,
        zipCodes: filterZips,
        found: results.totalCount
      })

    } catch (err) {
      setError('Failed to search vendors. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedCity, filterZips])

  // Perform search when filters change
  useEffect(() => {
    performSearch()
  }, [performSearch])

  const handleCityChange = (city: string | null, zips: string[]) => {
    setSelectedCity(city)
    setFilterZips(zips)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
  }

  const formatCategory = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Find Wedding Vendors</h1>
          <p className="text-gray-400">Discover amazing vendors for your special day</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 space-y-6">
              
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                  Search Vendors
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="text-lg font-medium text-gray-300 mb-3">Location</h3>
                <ZipCodeFilter 
                  onCityChange={handleCityChange}
                  className="bg-gray-800 p-4 rounded-md"
                />
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-lg font-medium text-gray-300 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {formatCategory(category)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory || selectedCity) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedCity(null)
                    setFilterZips([])
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {loading ? (
                  <p className="text-gray-400">Searching...</p>
                ) : (
                  <p className="text-gray-400">
                    Found {totalCount} vendor{totalCount !== 1 ? 's' : ''}
                    {selectedCity && ` in ${selectedCity}`}
                    {selectedCategory && ` for ${formatCategory(selectedCategory)}`}
                  </p>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!loading && vendors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        {vendor.businessName}
                      </h3>
                      {vendor.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-300">{vendor.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400">
                      <p className="capitalize">{formatCategory(vendor.category)}</p>
                      <p>{vendor.city}, {vendor.state}</p>
                      {vendor.zipcode && <p>ZIP: {vendor.zipcode}</p>}
                      {vendor.videoCount > 0 && (
                        <p>{vendor.videoCount} video{vendor.videoCount !== 1 ? 's' : ''}</p>
                      )}
                    </div>

                    {vendor.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {vendor.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {vendor.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                            +{vendor.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {vendor.domain && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <a
                          href={`https://${vendor.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && vendors.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No vendors found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or location
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedCity(null)
                    setFilterZips([])
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}