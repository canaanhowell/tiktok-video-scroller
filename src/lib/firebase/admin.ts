// Firebase Admin SDK for server-side operations
import admin from 'firebase-admin';
import type { Firestore, CollectionReference, Query, DocumentData } from 'firebase-admin/firestore';
import type { Vendor, Video, User, VendorSearchFilters, VideoSearchFilters } from '@/types/firebase';

let app: admin.app.App;

/**
 * Initialize and get Firebase Admin instance
 */
export function getFirebaseAdmin(): admin.app.App {
  if (!app) {
    // Always use environment variables for Firebase Admin
    // This prevents build errors in Vercel and other deployment environments
    
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'true-harmonic-website',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@true-harmonic-website.iam.gserviceaccount.com',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      }),
      projectId: process.env.FIREBASE_PROJECT_ID || 'true-harmonic-website',
    });
    
    console.log('Firebase Admin initialized with environment variables');
  }
  
  return app;
}

/**
 * Get Firestore instance
 */
export function getFirestore(): Firestore {
  const app = getFirebaseAdmin();
  return app.firestore();
}

/**
 * Type alias for Firestore Query
 */
export type FirestoreQuery = Query<DocumentData>;

/**
 * Get typed collection reference
 */
export function getCollection<T = DocumentData>(collectionName: string): CollectionReference<DocumentData> {
  return getFirestore().collection(collectionName);
}

/**
 * Build a type-safe query for vendors
 */
export function buildVendorQuery(
  collection: CollectionReference<DocumentData>,
  filters: VendorSearchFilters
): FirestoreQuery {
  let query: FirestoreQuery = collection;
  
  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }
  
  if (filters.city) {
    query = query.where('city', '==', filters.city);
  }
  
  if (filters.zipcode) {
    query = query.where('zipcode', '==', filters.zipcode);
  }
  
  // Note: Firestore doesn't support full-text search natively
  // Text filtering should be done after fetching results
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  return query;
}

/**
 * Build a type-safe query for videos
 */
export function buildVideoQuery(
  collection: CollectionReference<DocumentData>,
  filters: VideoSearchFilters
): FirestoreQuery {
  let query: FirestoreQuery = collection;
  
  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }
  
  if (filters.vendorId) {
    query = query.where('vendorId', '==', filters.vendorId);
  }
  
  if (filters.city) {
    query = query.where('city', '==', filters.city);
  }
  
  if (filters.zipcode) {
    query = query.where('zipcode', '==', filters.zipcode);
  }
  
  // Note: Add ordering in the route if needed
  // query = query.orderBy('createdAt', 'desc');
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  return query;
}

/**
 * Convert Firestore document to typed object
 */
export function docToObject<T>(doc: admin.firestore.DocumentSnapshot): T & { id: string } {
  return { id: doc.id, ...doc.data() } as T & { id: string };
}

// Initialize collections with proper structure
export async function initializeCollections() {
  const db = getFirestore();
  
  // Create vendors collection with sample data
  const vendorsRef = db.collection('vendors');
  
  // Create videos collection with sample data
  const videosRef = db.collection('videos');
  
  // Create users collection with sample data
  const usersRef = db.collection('users');
  
  console.log('Firebase collections initialized');
  return { vendorsRef, videosRef, usersRef };
}