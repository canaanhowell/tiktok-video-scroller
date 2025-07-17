#!/usr/bin/env python3
"""
Script to consolidate documentation in main/web_app/docs
Version 2: Includes Supabase to Firebase migration
"""
import os
import shutil
from datetime import datetime
from pathlib import Path
import json
import re

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

# Document categories based on analysis
DOC_CATEGORIES = {
    "implementation": {
        "title": "Implementation & Planning",
        "description": "Project implementation guides and plans (Firebase-based)",
        "files": [
            "implementation_guide.md",
            "implementation_plan.md", 
            "video-algorithm-prompt.md",
            "IMPLEMENTATION_STATUS.md"
        ]
    },
    "algorithms": {
        "title": "Algorithms & Technical Specs",
        "description": "Video feed algorithms and technical specifications",
        "files": [
            "VIDEO_FEED_ALGORITHM.md",
            "VIDEO_SCORING_ALGORITHM.md",
            "FEED_GENERATION_API.md",
            "USER_PREFERENCE_LEARNING.md"
        ]
    },
    "deployment": {
        "title": "Deployment & Infrastructure",
        "description": "Deployment guides and infrastructure configuration",
        "files": [
            "DEPLOYMENT_GUIDE.md",
            "deployment_config.md",
            "services_status.md",
            "verified-service-connections.md",
            "available_services.md"
        ]
    },
    "firebase": {
        "title": "Firebase Services",
        "description": "Firebase configuration, admin capabilities, and migration",
        "files": [
            "firebase_admin_summary.md",
            "FIREBASE_MIGRATION_GUIDE.md"  # Will create this
        ]
    },
    "cloud_services": {
        "title": "Cloud Services & CLI",
        "description": "Google Cloud and CLI documentation",
        "files": [
            "gcloud_cli_troubleshooting_summary.md",
            "cli_summary.md",
            "cli_tools.md"
        ]
    },
    "configuration": {
        "title": "Configuration & Credentials",
        "description": "Configuration files and credential management",
        "files": [
            "credentials_checklist.md",
            "credentials_checklist_updated.md",
            "current_tech_stack.md",
            "service-test-results.json"
        ]
    },
    "troubleshooting": {
        "title": "Troubleshooting & Fixes",
        "description": "Solutions to common issues and fixes",
        "files": [
            "bunny-cdn-issue-fix.md",
            "improve-video-quality.md",
            "phase1_summary.md"
        ]
    },
    "deprecated": {
        "title": "Deprecated (Supabase)",
        "description": "Documentation for deprecated Supabase implementation",
        "files": []  # Will be populated with Supabase-specific docs
    }
}

def migrate_supabase_references(content):
    """Replace Supabase references with Firebase equivalents"""
    replacements = {
        # Database
        'Supabase': 'Firebase',
        'supabase': 'firebase',
        'PostgreSQL': 'Firestore',
        'RLS policies': 'Firestore security rules',
        'Row Level Security': 'Firestore security rules',
        
        # Auth
        'Supabase Auth': 'Firebase Auth',
        'supabase.auth': 'firebase.auth',
        
        # Real-time
        'Supabase real-time': 'Firebase real-time listeners',
        'PostgreSQL subscriptions': 'Firestore real-time listeners',
        
        # Storage
        'Supabase Storage': 'Firebase Storage',
        
        # Cache
        'Upstash Redis': 'Firebase Functions + Firestore caching',
        
        # Database specific
        'CREATE TABLE': '// Firestore collection',
        'INSERT INTO': 'db.collection().add()',
        'SELECT': 'db.collection().get()',
        'UPDATE': 'db.collection().doc().update()',
        'DELETE': 'db.collection().doc().delete()',
    }
    
    migrated_content = content
    for old, new in replacements.items():
        migrated_content = migrated_content.replace(old, new)
    
    # Add migration notice if content was changed
    if migrated_content != content:
        migration_notice = """
> **Migration Notice**: This document has been updated to reflect the migration from Supabase to Firebase. 
> Original Supabase references have been replaced with Firebase equivalents.

"""
        migrated_content = migration_notice + migrated_content
    
    return migrated_content

def create_firebase_migration_guide():
    """Create a comprehensive Firebase migration guide"""
    content = """# Firebase Migration Guide

This guide documents the migration from Supabase to Firebase for the Wedding Vendor Discovery Platform.

## Migration Overview

### Why Firebase?
- Better real-time capabilities
- Easier mobile development
- More reliable tooling for coding agents
- Integrated suite of tools (Auth, Firestore, Storage, Functions)
- Superior offline support

### What's Changing

#### Database
- **From**: Supabase (PostgreSQL)
- **To**: Firebase Firestore (NoSQL)
- **Key Changes**:
  - Denormalized data structure for better performance
  - Document-based instead of relational
  - Real-time listeners instead of subscriptions

#### Authentication
- **From**: Supabase Auth
- **To**: Firebase Auth
- **Key Changes**:
  - Custom claims for role management
  - Multi-provider authentication support
  - Better mobile SDK integration

#### Storage
- **From**: Supabase Storage + Bunny CDN
- **To**: Firebase Storage + Bunny CDN
- **Key Changes**:
  - Firebase Storage for images and documents
  - Bunny CDN continues for video streaming
  - Integrated security rules

#### Real-time Features
- **From**: PostgreSQL subscriptions
- **To**: Firestore real-time listeners
- **Key Changes**:
  - Automatic offline support
  - More granular real-time updates
  - Better performance at scale

## Data Structure Migration

### User Collection (Previously users table)
```javascript
// Firestore structure
users/{userId} {
  email: string,
  role: 'consumer' | 'vendor' | 'admin',
  profile: {
    name: string,
    preferences: {
      categories: string[],
      styles: string[],
      budgetRange: string
    }
  },
  createdAt: timestamp
}
```

### Videos Collection (Previously videos table)
```javascript
videos/{videoId} {
  bunnyVideoId: string,
  title: string,
  vendorId: string,
  categories: string[],
  performanceMetrics: {
    views: number,
    likes: number,
    engagementRate: number
  }
}
```

## Security Rules Migration

### From RLS Policies to Firestore Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Videos are public read, vendor write
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'vendor';
    }
  }
}
```

## API Migration

### Database Operations
```javascript
// Supabase
const { data } = await supabase
  .from('videos')
  .select('*')
  .eq('category', 'photography');

// Firebase
const snapshot = await db
  .collection('videos')
  .where('categories', 'array-contains', 'photography')
  .get();
```

### Real-time Subscriptions
```javascript
// Supabase
const subscription = supabase
  .from('videos')
  .on('INSERT', handleNewVideo)
  .subscribe();

// Firebase
const unsubscribe = db
  .collection('videos')
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        handleNewVideo(change.doc.data());
      }
    });
  });
```

## Current Implementation Status

### ✅ Completed
- Firebase CLI installation and configuration
- Google Cloud CLI setup
- Firestore database creation
- Firebase Admin SDK integration
- All Firebase services enabled

### 🚧 In Progress
- Data migration scripts
- API endpoint updates
- Security rules implementation

### 📋 TODO
- Update all API endpoints to use Firebase
- Migrate existing user data
- Update frontend components
- Test all features with Firebase

## Migration Checklist

- [ ] Update all database queries to Firestore syntax
- [ ] Replace Supabase client with Firebase client
- [ ] Update authentication flows
- [ ] Migrate existing data
- [ ] Update environment variables
- [ ] Test all features
- [ ] Update deployment configuration
- [ ] Train team on Firebase

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Migration Best Practices](https://firebase.google.com/docs/firestore/solutions/migration)
"""
    
    guide_path = Path("/app/main/web_app/docs/FIREBASE_MIGRATION_GUIDE.md")
    guide_path.write_text(content)
    log_action("Created Firebase migration guide")

def backup_docs():
    """Create backup of existing docs"""
    backup_dir = Path("/app/main/web_app/docs/backup")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"docs_backup_{timestamp}"
    
    log_action(f"Creating backup at {backup_path}")
    
    # Create backup directory
    backup_path.mkdir(parents=True, exist_ok=True)
    
    # Copy all current docs
    docs_dir = Path("/app/main/web_app/docs")
    for file in docs_dir.iterdir():
        if file.is_file() and file.name not in ['backup']:
            shutil.copy2(file, backup_path / file.name)
            log_action(f"Backed up {file.name}")
    
    return backup_path

def update_tech_stack_doc():
    """Update the current tech stack documentation"""
    content = """# Current Technology Stack

**Last Updated**: """ + datetime.now().strftime('%Y-%m-%d') + """

## Core Technologies

### Frontend/Backend
- **Framework**: Next.js 15.4.1 on Vercel
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Framer Motion

### Database & Backend Services
- **Primary Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Real-time**: Firestore real-time listeners
- **Serverless Functions**: Firebase Functions
- **Storage**: Firebase Storage (documents/images)

### Video Infrastructure
- **Video CDN**: Bunny CDN Stream Library
- **Video Player**: HLS.js for adaptive streaming
- **Video Processing**: Bunny CDN encoding

### Cloud Services
- **Cloud Platform**: Google Cloud Platform
- **Project**: web-scroller
- **CLI Tools**: gcloud CLI, Firebase CLI
- **Service Account**: admin-968@web-scroller.iam.gserviceaccount.com

### Development Tools
- **Version Control**: Git/GitHub
- **Deployment**: Vercel CLI
- **Package Manager**: npm
- **Testing**: Jest (planned)

## Architecture Overview

### Data Flow
1. **Content Upload**: Vendors → Firebase Storage → Bunny CDN
2. **User Interactions**: Client → Firestore → Real-time updates
3. **Analytics**: Client → Firebase Functions → Firestore aggregation
4. **Matching**: Firestore queries → Firebase Functions → Personalized results

### Security Model
- **Authentication**: Firebase Auth with custom claims
- **Authorization**: Firestore security rules
- **Data Protection**: Field-level security in Firestore
- **API Security**: Firebase App Check (planned)

## Migration from Supabase

We have migrated from Supabase to Firebase for the following benefits:
- Better real-time capabilities
- Superior offline support
- Integrated tooling
- Easier mobile development
- More reliable for AI agents

See [Firebase Migration Guide](./FIREBASE_MIGRATION_GUIDE.md) for details.
"""
    
    tech_path = Path("/app/main/web_app/docs/current_tech_stack.md")
    tech_path.write_text(content)
    log_action("Updated current tech stack documentation")

def migrate_existing_docs():
    """Migrate existing documentation to reflect Firebase usage"""
    docs_dir = Path("/app/main/web_app/docs")
    
    # List of files that need migration
    files_to_migrate = [
        "implementation_guide.md",
        "implementation_plan.md",
        "DEPLOYMENT_GUIDE.md",
        "VIDEO_FEED_ALGORITHM.md",
        "FEED_GENERATION_API.md"
    ]
    
    migrated_count = 0
    
    for filename in files_to_migrate:
        file_path = docs_dir / filename
        if file_path.exists():
            # Read content
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Migrate content
            migrated_content = migrate_supabase_references(content)
            
            # Only write if content changed
            if migrated_content != content:
                # Save original to deprecated
                deprecated_path = docs_dir / f"deprecated_supabase_{filename}"
                with open(deprecated_path, 'w') as f:
                    f.write(content)
                
                # Write migrated content
                with open(file_path, 'w') as f:
                    f.write(migrated_content)
                
                log_action(f"Migrated {filename} to Firebase")
                migrated_count += 1
                
                # Add to deprecated category
                DOC_CATEGORIES["deprecated"]["files"].append(f"deprecated_supabase_{filename}")
    
    return migrated_count

def create_master_index():
    """Create master index file with Firebase focus"""
    content = """# Web App Documentation Index

This is the consolidated documentation for the Wedding Vendor Discovery Platform, now powered by Firebase.

## 🔥 Firebase Migration Status

**We have migrated from Supabase to Firebase.** All new development should use Firebase services.

- ✅ Firebase setup complete
- ✅ Firestore database created
- ✅ Authentication configured
- 🚧 Data migration in progress
- 📋 API updates pending

See [Firebase Migration Guide](./FIREBASE_MIGRATION_GUIDE.md) for details.

## Document Categories

"""
    
    for category_id, category in DOC_CATEGORIES.items():
        if category_id == "deprecated":
            content += f"\n### ⚠️ {category['title']}\n"
        else:
            content += f"### {category['title']}\n"
        content += f"{category['description']}\n\n"
        
        for file in category['files']:
            # Check if file exists
            file_path = Path(f"/app/main/web_app/docs/{file}")
            if file_path.exists():
                content += f"- [{file}](./{file})\n"
            else:
                content += f"- {file} (missing)\n"
        content += "\n"
    
    # Add metadata
    content += f"""## Documentation Metadata

- **Last Updated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Total Documents**: {sum(len(cat['files']) for cat in DOC_CATEGORIES.values())}
- **Categories**: {len(DOC_CATEGORIES)}
- **Tech Stack**: Firebase + Next.js + Vercel

## Quick Links

### 🚀 Getting Started
- [Firebase Migration Guide](./FIREBASE_MIGRATION_GUIDE.md) - **Start Here**
- [Current Tech Stack](./current_tech_stack.md) - Updated technology overview
- [Firebase Admin Summary](./firebase_admin_summary.md) - Firebase capabilities

### 📋 Implementation
- [Implementation Guide](./implementation_guide.md) - Complete roadmap (Firebase-based)
- [Video Algorithm Prompt](./video-algorithm-prompt.md) - Firebase implementation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to deploy

### 🛠️ Technical Documentation
- [Video Feed Algorithm](./VIDEO_FEED_ALGORITHM.md) - Core algorithm
- [Feed Generation API](./FEED_GENERATION_API.md) - API documentation
- [User Preference Learning](./USER_PREFERENCE_LEARNING.md) - ML components

### 🔧 Troubleshooting
- [GCloud CLI Troubleshooting](./gcloud_cli_troubleshooting_summary.md) - CLI fixes
- [Bunny CDN Fix](./bunny-cdn-issue-fix.md) - CDN issues

## Firebase Resources

- **Project ID**: web-scroller
- **Console**: https://console.firebase.google.com/project/web-scroller
- **Firestore**: https://console.firebase.google.com/project/web-scroller/firestore
- **Service Account**: admin-968@web-scroller.iam.gserviceaccount.com
"""
    
    # Write master index
    index_path = Path("/app/main/web_app/docs/README.md")
    index_path.write_text(content)
    log_action("Created Firebase-focused master index")
    
    return index_path

def create_consolidated_implementation():
    """Create consolidated implementation guide with Firebase focus"""
    docs_dir = Path("/app/main/web_app/docs")
    
    # Read the Firebase implementation guide
    firebase_guide_path = docs_dir / "video-algorithm-prompt.md"
    
    consolidated_content = """# Consolidated Implementation Guide (Firebase)

This document consolidates all implementation documentation for the Wedding Vendor Discovery Platform using Firebase as the primary backend.

## Table of Contents

1. [Firebase Implementation](#firebase-implementation)
2. [Migration from Supabase](#migration-from-supabase)
3. [Current Status](#current-status)
4. [Next Steps](#next-steps)

---

"""
    
    # Add Firebase implementation
    if firebase_guide_path.exists():
        with open(firebase_guide_path, 'r') as f:
            consolidated_content += "## Firebase Implementation\n\n"
            consolidated_content += f.read()
            consolidated_content += "\n\n---\n\n"
    
    # Add migration guide content
    consolidated_content += """## Migration from Supabase

We are migrating from Supabase to Firebase for improved real-time capabilities, better mobile support, and more integrated tooling.

### Key Changes:
- **Database**: PostgreSQL → Firestore
- **Auth**: Supabase Auth → Firebase Auth  
- **Real-time**: Subscriptions → Firestore listeners
- **Storage**: Supabase Storage → Firebase Storage
- **Functions**: Edge Functions → Firebase Functions

### Migration Status:
- ✅ Firebase project setup complete
- ✅ Firestore database created
- ✅ Authentication configured
- 🚧 Data migration in progress
- 📋 Frontend updates pending

---

## Current Status

### Completed Features
1. **Core Video Scrolling** - TikTok-style interface
2. **User Preference Learning** - Behavioral tracking
3. **Personalized Feed Algorithm** - 70/30 preference/exploration
4. **Firebase Infrastructure** - All services enabled
5. **Admin Tools** - CLI and SDK configured

### In Progress
1. **Vendor System** - Registration and onboarding
2. **Data Migration** - Moving from Supabase to Firebase
3. **API Updates** - Converting endpoints to Firebase

### Upcoming
1. **Vendor Dashboard** - Content management
2. **Matching System** - Couple-vendor matching
3. **Communication Platform** - Messaging and quotes

---

## Next Steps

1. **Complete Data Migration**
   - Export existing Supabase data
   - Transform to Firestore structure
   - Import to Firebase

2. **Update API Endpoints**
   - Replace Supabase client with Firebase
   - Update all database queries
   - Test authentication flows

3. **Implement Vendor System**
   - Vendor registration with Firebase Auth
   - Profile management in Firestore
   - Content upload to Firebase Storage

4. **Deploy Updated Version**
   - Update environment variables
   - Deploy to Vercel
   - Monitor for issues

See individual documentation files for detailed implementation guides.
"""
    
    # Write consolidated file
    consolidated_path = docs_dir / "CONSOLIDATED_IMPLEMENTATION.md"
    consolidated_path.write_text(consolidated_content)
    log_action("Created consolidated Firebase implementation guide")

def main():
    """Main consolidation function with Firebase migration"""
    log_action("Starting documentation consolidation with Firebase migration")
    
    # Step 1: Create Firebase migration guide
    create_firebase_migration_guide()
    log_action("Created Firebase migration guide")
    
    # Step 2: Backup existing docs
    backup_path = backup_docs()
    log_action(f"Backup completed at {backup_path}")
    
    # Step 3: Update tech stack documentation
    update_tech_stack_doc()
    log_action("Updated tech stack documentation")
    
    # Step 4: Migrate existing docs to Firebase
    migrated_count = migrate_existing_docs()
    log_action(f"Migrated {migrated_count} documents to Firebase")
    
    # Step 5: Create master index with Firebase focus
    index_path = create_master_index()
    log_action(f"Master index created at {index_path}")
    
    # Step 6: Create consolidated implementation guide
    create_consolidated_implementation()
    log_action("Created consolidated implementation guide")
    
    # Step 7: Create category indexes
    from consolidate_docs import create_category_indexes, create_documentation_summary
    create_category_indexes()
    log_action("Category indexes created")
    
    # Step 8: Create documentation summary
    summary = create_documentation_summary()
    log_action(f"Documentation summary created")
    
    log_action("Documentation consolidation with Firebase migration completed!")
    
    # Print summary
    print("\nDocumentation Consolidation Summary:")
    print("=" * 50)
    print("Firebase Migration Integration:")
    print(f"- Documents migrated to Firebase: {migrated_count}")
    print(f"- Deprecated Supabase docs: {len(DOC_CATEGORIES['deprecated']['files'])}")
    print("\nNew files created:")
    print("- README.md (Firebase-focused master index)")
    print("- FIREBASE_MIGRATION_GUIDE.md")
    print("- CONSOLIDATED_IMPLEMENTATION.md (Firebase version)")
    print("- current_tech_stack.md (updated)")
    print(f"\nBackup location: {backup_path}")
    print("\n✅ Documentation is now Firebase-ready!")

if __name__ == "__main__":
    main()