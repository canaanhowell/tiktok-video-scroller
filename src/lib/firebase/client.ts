import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Initialize Firebase only on the client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  // Check if Firebase app is already initialized
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };

// Helper function to ensure Firebase is initialized
export function ensureFirebaseInitialized() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client SDK can only be used in the browser');
  }
  
  if (!app) {
    throw new Error('Firebase has not been initialized');
  }
  
  return { app, auth, db, storage };
}