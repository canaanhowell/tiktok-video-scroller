# Firebase Integration Guide

## Overview

This directory contains the Firebase integration for the application, including type-safe wrappers for Firebase Admin SDK and Firestore operations.

## Architecture

### Type System

We use a strongly-typed approach to Firebase/Firestore operations to ensure type safety and prevent runtime errors.

```typescript
// Instead of using 'any' types:
let query: any = collection;  // ❌ Bad

// We use proper types:
let query: FirestoreQuery = collection;  // ✅ Good
```

### Key Files

- **`admin.ts`** - Firebase Admin SDK initialization and type-safe utility functions
- **`/types/firebase.ts`** - TypeScript interfaces for all data models
- **API Routes** - Use the type-safe functions from admin.ts

## Data Models

### Vendor
```typescript
interface Vendor {
  id?: string;
  name: string;
  category: string;
  city: string;
  state: string;
  zipcode: string;
  // ... other fields
}
```

### Video
```typescript
interface Video {
  id?: string;
  title: string;
  vendorId: string;
  category: string;
  // ... other fields
}
```

## Usage Examples

### Querying Vendors
```typescript
import { getCollection, buildVendorQuery, docToObject } from '@/lib/firebase/admin';
import type { Vendor, VendorSearchFilters } from '@/types/firebase';

const filters: VendorSearchFilters = {
  category: 'photographers',
  city: 'Nashville',
  limit: 20
};

const vendorsCollection = getCollection('vendors');
const query = buildVendorQuery(vendorsCollection, filters);
const snapshot = await query.get();

const vendors: Vendor[] = [];
snapshot.forEach((doc) => {
  vendors.push(docToObject<Vendor>(doc));
});
```

### Error Handling
```typescript
import { isFirebaseError } from '@/types/firebase';

try {
  // Firebase operations
} catch (error) {
  if (isFirebaseError(error)) {
    console.log('Firebase error code:', error.code);
  }
  // Handle error appropriately
}
```

## Environment Variables

Required environment variables for Firebase Admin SDK:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## Best Practices

1. **Always use typed functions** - Use the utility functions from `admin.ts` instead of raw Firestore API
2. **Handle errors properly** - Use the `isFirebaseError` type guard for better error handling
3. **Type your data** - Always specify types when fetching data: `docToObject<Vendor>(doc)`
4. **Avoid 'any' types** - The type system is there to help catch errors at compile time

## Common Patterns

### Building Complex Queries
```typescript
// For special query requirements (like ZIP code searches)
let query: FirestoreQuery;

if (specialCondition) {
  // Build query with modifications
  query = buildVendorQuery(collection, baseFilters);
  query = query.where('specialField', 'in', values);
} else {
  // Normal query
  query = buildVendorQuery(collection, filters);
}
```

### Batch Operations
```typescript
// Fetch multiple documents efficiently
const vendorIds = ['id1', 'id2', 'id3'];
const vendorPromises = vendorIds.map(id => 
  vendorsCollection.doc(id).get()
);
const vendorDocs = await Promise.all(vendorPromises);
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors related to Firebase types:

1. Check that you're importing types correctly
2. Use the utility functions instead of raw Firestore API
3. Ensure all data models have proper interfaces

### Build Errors

Common build errors and solutions:

- **"Type 'Query' is missing properties..."** - Use `FirestoreQuery` type alias
- **"Parameter implicitly has 'any' type"** - Add proper type annotations
- **"Property does not exist on type 'unknown'"** - Use type guards like `isFirebaseError`

## Future Improvements

1. Add caching layer for frequently accessed data
2. Implement real-time listeners with proper typing
3. Add transaction support with type safety
4. Create indexes for complex queries

---

*Last Updated: January 2025*