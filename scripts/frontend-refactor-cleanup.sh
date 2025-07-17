#!/bin/bash

# Frontend Refactor Cleanup Script
# Removes all backend code from the TikTok video scroller to prepare for service layer architecture
# Based on audit findings in docs/frontend_refactor_prompt.md

echo "🔧 Frontend Refactor: Removing Backend Code"
echo "=============================================="

# Safety check
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from web_app directory"
    exit 1
fi

# Create backup directory for important files before deletion
echo "📦 Creating backup directory..."
mkdir -p cleanup_backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="cleanup_backup/$(date +%Y%m%d_%H%M%S)"

echo "🗂️ PHASE 1: Removing Backend API Routes"
echo "----------------------------------------"
if [ -d "src/app/api" ]; then
    echo "  📋 Backing up API routes to $BACKUP_DIR/api/"
    cp -r src/app/api "$BACKUP_DIR/"
    echo "  ❌ Removing src/app/api/ (entire backend API layer)"
    rm -rf src/app/api/
    echo "  ✅ Backend API routes removed"
else
    echo "  ℹ️ No API routes found (already clean)"
fi

echo ""
echo "🗂️ PHASE 2: Removing Backend Services"
echo "--------------------------------------"
if [ -d "src/services" ]; then
    echo "  📋 Backing up services to $BACKUP_DIR/services/"
    cp -r src/services "$BACKUP_DIR/"
    echo "  ❌ Removing src/services/ (backend service implementations)"
    rm -rf src/services/
    echo "  ✅ Backend services removed"
else
    echo "  ℹ️ No backend services found (already clean)"
fi

echo ""
echo "🗂️ PHASE 3: Removing Database Code"
echo "-----------------------------------"
if [ -d "src/database" ]; then
    echo "  📋 Backing up database to $BACKUP_DIR/database/"
    cp -r src/database "$BACKUP_DIR/"
    echo "  ❌ Removing src/database/ (database schema and migrations)"
    rm -rf src/database/
    echo "  ✅ Database code removed"
else
    echo "  ℹ️ No database code found (already clean)"
fi

echo ""
echo "🗂️ PHASE 4: Removing Server-Side Library Code"
echo "----------------------------------------------"

# Firebase Admin SDK
if [ -f "src/lib/firebase/admin.ts" ]; then
    echo "  ❌ Removing Firebase Admin SDK (src/lib/firebase/admin.ts)"
    rm src/lib/firebase/admin.ts
fi

if [ -f "src/lib/firebase/auth-middleware.ts" ]; then
    echo "  ❌ Removing Firebase auth middleware (src/lib/firebase/auth-middleware.ts)"
    rm src/lib/firebase/auth-middleware.ts
fi

if [ -f "src/lib/firebase/auth-helpers.ts" ]; then
    echo "  ❌ Removing Firebase auth helpers (src/lib/firebase/auth-helpers.ts)"
    rm src/lib/firebase/auth-helpers.ts
fi

# Supabase Server
if [ -d "src/lib/supabase/backup" ]; then
    echo "  ❌ Removing Supabase backup files (src/lib/supabase/backup/)"
    rm -rf src/lib/supabase/backup/
fi

# Redis/Upstash
if [ -d "src/lib/redis" ]; then
    echo "  📋 Backing up Redis config to $BACKUP_DIR/redis/"
    cp -r src/lib/redis "$BACKUP_DIR/"
    echo "  ❌ Removing Redis client (src/lib/redis/)"
    rm -rf src/lib/redis/
fi

# Bunny CDN server-side
if [ -d "src/lib/bunny" ]; then
    echo "  📋 Backing up Bunny CDN config to $BACKUP_DIR/bunny/"
    cp -r src/lib/bunny "$BACKUP_DIR/"
    echo "  ❌ Removing Bunny CDN server-side code (src/lib/bunny/)"
    rm -rf src/lib/bunny/
fi

echo ""
echo "🗂️ PHASE 5: Removing Database Types"
echo "------------------------------------"
if [ -f "src/types/database.ts" ]; then
    echo "  ❌ Removing database types (src/types/database.ts)"
    rm src/types/database.ts
fi

if [ -d "src/types/backup" ]; then
    echo "  ❌ Removing type backup files (src/types/backup/)"
    rm -rf src/types/backup/
fi

echo ""
echo "🗂️ PHASE 6: Removing Backend Context Files"
echo "-------------------------------------------"
if [ -d "src/contexts/backup" ]; then
    echo "  ❌ Removing context backup files (src/contexts/backup/)"
    rm -rf src/contexts/backup/
fi

echo ""
echo "🗂️ PHASE 7: Cleaning Database Scripts"
echo "--------------------------------------"
if [ -d "scripts/database" ]; then
    echo "  📋 Backing up database scripts to $BACKUP_DIR/scripts_database/"
    cp -r scripts/database "$BACKUP_DIR/scripts_database/"
    echo "  ❌ Removing database scripts (scripts/database/)"
    rm -rf scripts/database/
fi

# Clean up other backend-related scripts
BACKEND_SCRIPTS=(
    "scripts/test-all-services.js"
    "scripts/service-config.js"
    "scripts/upload-input-videos.js"
    "scripts/test_analytics.py"
    "scripts/test_feed_generation.py"
    "scripts/test_firebase_admin.py"
    "scripts/test_firebase_admin_complete.py"
    "scripts/test_firebase_auth.py"
    "scripts/test_preferences.py"
    "scripts/test_scoring.py"
)

echo "  🧹 Removing backend-related scripts..."
for script in "${BACKEND_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "    ❌ $script"
        rm "$script"
    fi
done

echo ""
echo "🗂️ PHASE 8: Preserving Frontend-Only Files"
echo "-------------------------------------------"
echo "  ✅ Keeping src/lib/firebase/client.ts (frontend Firebase)"
echo "  ✅ Keeping src/lib/firebase/config.ts (Firebase config)"
echo "  ✅ Keeping src/lib/supabase/client.ts (frontend Supabase)"
echo "  ✅ Keeping all components in src/components/"
echo "  ✅ Keeping all hooks in src/hooks/"
echo "  ✅ Keeping frontend pages in src/app/"
echo "  ✅ Keeping VideoScrollerFresh.tsx (working video solution)"

echo ""
echo "📊 CLEANUP SUMMARY"
echo "==================="
echo "✅ Backend API routes removed"
echo "✅ Backend service implementations removed"
echo "✅ Database schema and migrations removed"
echo "✅ Server-side libraries cleaned up"
echo "✅ Backend scripts removed"
echo "✅ Frontend-only code preserved"
echo ""
echo "📦 Backup created at: $BACKUP_DIR"
echo "🎯 Frontend is now clean and ready for service layer architecture"
echo ""
echo "📋 Next Steps:"
echo "1. Run npm install to update dependencies"
echo "2. Create service layer interfaces"
echo "3. Update components to use service layer"
echo "4. Test that video functionality still works"

# Count remaining files for verification
echo ""
echo "📈 File Count After Cleanup:"
echo "Components: $(find src/components -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)"
echo "Hooks: $(find src/hooks -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)"
echo "Pages: $(find src/app -name "page.tsx" 2>/dev/null | wc -l)"
echo "Lib files: $(find src/lib -name "*.ts" 2>/dev/null | wc -l)"