/**
 * Firebase Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for Firebase/Firestore
 * data models and operations. This ensures type safety across the application
 * and helps future developers understand the data structure.
 */

import type { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * Vendor data model
 */
export interface Vendor {
  id?: string; // ID is optional since it's added after fetching
  name: string;
  category: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
  state: string;
  zipcode: string;
  services?: string[];
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  featured?: boolean;
  verified?: boolean;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

/**
 * Video data model
 */
export interface Video {
  id?: string; // ID is optional since it's added after fetching
  title: string;
  description?: string;
  src: string;
  poster?: string;
  category: string;
  vendorId: string;
  vendorName?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  tags?: string[];
  likes?: number;
  views?: number;
  shares?: number;
  comments?: number;
  duration?: number;
  resolution?: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  featured?: boolean;
  status?: 'active' | 'pending' | 'archived';
}

/**
 * User data model
 */
export interface User {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'user' | 'vendor' | 'admin';
  favoriteVendors?: string[];
  savedVideos?: string[];
  createdAt?: Timestamp | FieldValue;
  lastLogin?: Timestamp | FieldValue;
}

/**
 * Search filters for vendors
 */
export interface VendorSearchFilters {
  q?: string; // Text search query
  category?: string;
  city?: string;
  zipcode?: string;
  page?: number;
  limit?: number;
}

/**
 * Search filters for videos
 */
export interface VideoSearchFilters {
  category?: string;
  vendorId?: string;
  city?: string;
  zipcode?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

/**
 * Firebase error with code
 */
export interface FirebaseError extends Error {
  code?: string;
  details?: any;
}

/**
 * Type guard to check if an error is a Firebase error
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof Error && typeof (error as any).code === 'string';
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  hits: T[];
  found: number;
  page: number;
  totalPages: number;
  limit: number;
}