#!/usr/bin/env python3
"""
Smart script to replace Supabase references with Firebase in the codebase
This version uses context-aware replacements to avoid nonsensical changes
"""
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
import json

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

# Context-aware replacements
def smart_replace(content, file_path):
    """Perform context-aware replacements"""
    file_name = Path(file_path).name
    replacements_made = 0
    
    # Skip replacement in migration-related files
    migration_keywords = ['migration', 'migrate', 'deprecated', 'backup']
    if any(keyword in file_name.lower() for keyword in migration_keywords):
        log_action(f"Skipping replacements in migration file: {file_name}")
        return content, 0
    
    # Environment variable replacements
    env_replacements = [
        # Supabase env vars -> Firebase env vars
        (r'supabase_access_token\s*=\s*([^\n]+)', r'# Legacy Supabase - replaced by Firebase\n# supabase_access_token = \1\nFIREBASE_SERVICE_ACCOUNT_KEY = /app/main/web_app/google_service_key.json'),
        (r'supabase_database_password\s*=\s*([^\n]+)', r'# supabase_database_password = \1'),
        (r'supabase_publishable_key\s*=\s*([^\n]+)', r'# supabase_publishable_key = \1'),
        (r'supabase_secret_key\s*=\s*([^\n]+)', r'# supabase_secret_key = \1'),
        (r'supabase_project_url\s*=\s*([^\n]+)', r'# supabase_project_url = \1\nFIREBASE_PROJECT_ID = web-scroller'),
        (r'supabase_project_api\s*=\s*([^\n]+)', r'# supabase_project_api = \1\nFIREBASE_API_KEY = AIzaSyBqN2L4mfYRJ3bQxR8CzYCL8EqD9V4sMhY'),
        (r'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        (r'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_FIREBASE_API_KEY'),
        (r'SUPABASE_SERVICE_ROLE_KEY', 'FIREBASE_ADMIN_SDK_KEY'),
    ]
    
    # Code replacements
    code_replacements = [
        # Import statements
        (r"import\s*{\s*createClient\s*}\s*from\s*['\"]@supabase/supabase-js['\"]", 
         "import { initializeApp } from 'firebase/app'\nimport { getFirestore } from 'firebase/firestore'\nimport { getAuth } from 'firebase/auth'"),
        
        # Supabase client initialization
        (r"createClient\s*\([^)]+\)", "initializeApp(firebaseConfig)"),
        
        # Database queries
        (r"supabase\.from\s*\(\s*['\"](\w+)['\"]\s*\)", r"db.collection('\1')"),
        (r"\.select\s*\(\s*['\"]([^'\"]+)['\"]\s*\)", ".get()"),
        (r"\.insert\s*\(\s*([^)]+)\s*\)", r".add(\1)"),
        (r"\.update\s*\(\s*([^)]+)\s*\)", r".update(\1)"),
        (r"\.delete\s*\(\s*\)", ".delete()"),
        (r"\.eq\s*\(\s*['\"](\w+)['\"]\s*,\s*([^)]+)\s*\)", r".where('\1', '==', \2)"),
        
        # Auth
        (r"supabase\.auth\.signIn", "auth.signInWithEmailAndPassword"),
        (r"supabase\.auth\.signUp", "auth.createUserWithEmailAndPassword"),
        (r"supabase\.auth\.signOut", "auth.signOut"),
        (r"supabase\.auth\.user", "auth.currentUser"),
        
        # Storage
        (r"supabase\.storage", "storage"),
        
        # Package names
        (r"@supabase/supabase-js", "firebase/app"),
        (r"@supabase/auth-helpers-react", "firebase/auth"),
        (r"@supabase/auth-helpers-nextjs", "firebase/auth"),
    ]
    
    # Apply environment variable replacements if it's an env file
    if file_path.endswith('.env') or '.env.' in file_path:
        for pattern, replacement in env_replacements:
            new_content, count = re.subn(pattern, replacement, content, flags=re.MULTILINE)
            if count > 0:
                content = new_content
                replacements_made += count
    else:
        # Apply code replacements
        for pattern, replacement in code_replacements:
            new_content, count = re.subn(pattern, replacement, content)
            if count > 0:
                content = new_content
                replacements_made += count
        
        # Context-aware word replacements
        # Only replace standalone "Supabase" not in migration contexts
        if 'migration' not in content.lower() and 'migrate' not in content.lower():
            # Replace service names carefully
            content = re.sub(r'\bSupabase\b(?!\s+to\s+Firebase)', 'Firebase', content)
            content = re.sub(r'\bsupabase\b(?!\s+to\s+firebase)', 'firebase', content)
            
        # Database terminology
        content = content.replace('PostgreSQL database', 'Firestore database')
        content = content.replace('Postgres', 'Firestore')
        content = content.replace('RLS policies', 'Firestore security rules')
        content = content.replace('Row Level Security', 'Firestore security rules')
    
    return content, replacements_made

# File extensions to process
PROCESSABLE_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', 
    '.env', '.env', '.env.production',
    '.yml', '.yaml'
]

# Directories to skip
SKIP_DIRS = [
    'node_modules', '.git', '.next', 'dist', 'build',
    '.vercel', 'coverage', '__pycache__', '.pytest_cache',
    'backup'
]

# Files to completely skip
SKIP_FILES = [
    'migrate_supabase_to_firebase.py',
    'smart_firebase_migration.py',  # This script
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'firebase_migration_report.json'
]

def create_backup(file_path):
    """Create a backup of the file before modification"""
    backup_dir = Path(file_path).parent / 'backup'
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{Path(file_path).stem}_smart_backup_{timestamp}{Path(file_path).suffix}"
    backup_path = backup_dir / backup_name
    
    shutil.copy2(file_path, backup_path)
    return backup_path

def restore_from_backup(file_path):
    """Restore file from the original Supabase backup"""
    backup_dir = Path(file_path).parent / 'backup'
    
    # Find the original supabase backup
    backup_files = list(backup_dir.glob(f"{Path(file_path).stem}_supabase_backup_*{Path(file_path).suffix}"))
    
    if backup_files:
        # Sort by timestamp and get the latest
        backup_files.sort()
        original_backup = backup_files[-1]
        
        # Restore the file
        shutil.copy2(original_backup, file_path)
        log_action(f"Restored {file_path} from {original_backup}")
        return True
    
    return False

def should_process_file(file_path):
    """Check if file should be processed"""
    path = Path(file_path)
    
    # Skip if in skip list
    if path.name in SKIP_FILES:
        return False
    
    # Skip if not a processable extension
    if path.suffix not in PROCESSABLE_EXTENSIONS:
        return False
    
    # Skip if in skip directory
    for skip_dir in SKIP_DIRS:
        if skip_dir in path.parts:
            return False
    
    return True

def process_file(file_path, restore_first=True):
    """Process a single file with smart replacements"""
    
    # First restore from original backup if requested
    if restore_first:
        if not restore_from_backup(file_path):
            log_action(f"No backup found for {file_path}, processing current version")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        log_action(f"Error reading {file_path}: {e}")
        return False, 0
    
    original_content = content
    
    # Apply smart replacements
    content, replacement_count = smart_replace(content, str(file_path))
    
    # Check if content changed
    if content != original_content:
        # Create new backup
        backup_path = create_backup(file_path)
        log_action(f"Created backup: {backup_path}")
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, replacement_count
    
    return False, 0

def find_modified_files():
    """Find all files that were modified in the previous migration"""
    report_path = Path("/app/main/web_app/logs/firebase_migration_report.json")
    
    if report_path.exists():
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        return [Path(file_info['path']) for file_info in report.get('modified_files', [])]
    
    return []

def generate_report(results):
    """Generate a migration report"""
    report = {
        "migration_date": datetime.now().isoformat(),
        "migration_type": "smart_replacement",
        "files_processed": results['files_processed'],
        "files_modified": results['files_modified'],
        "total_replacements": results['total_replacements'],
        "modified_files": results['modified_files'],
        "errors": results['errors']
    }
    
    report_path = Path("/app/main/web_app/logs/smart_firebase_migration_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    return report_path

def main():
    """Main migration function"""
    log_action("Starting smart Firebase migration")
    
    # Get list of previously modified files
    modified_files = find_modified_files()
    log_action(f"Found {len(modified_files)} files from previous migration")
    
    # Process results
    results = {
        'files_processed': 0,
        'files_modified': 0,
        'total_replacements': 0,
        'modified_files': [],
        'errors': []
    }
    
    # Process each previously modified file
    for file_path in modified_files:
        if not file_path.exists():
            log_action(f"File no longer exists: {file_path}")
            continue
            
        if not should_process_file(file_path):
            log_action(f"Skipping: {file_path}")
            continue
        
        log_action(f"Processing: {file_path}")
        
        try:
            modified, count = process_file(file_path, restore_first=True)
            results['files_processed'] += 1
            
            if modified:
                results['files_modified'] += 1
                results['total_replacements'] += count
                results['modified_files'].append({
                    'path': str(file_path),
                    'replacements': count
                })
                log_action(f"Modified {file_path} with {count} smart replacements")
        except Exception as e:
            error_msg = f"Error processing {file_path}: {str(e)}"
            log_action(error_msg)
            results['errors'].append(error_msg)
    
    # Generate report
    report_path = generate_report(results)
    log_action(f"Smart migration report saved to: {report_path}")
    
    # Print summary
    print("\n" + "="*50)
    print("Smart Firebase Migration Summary")
    print("="*50)
    print(f"Files processed: {results['files_processed']}")
    print(f"Files modified: {results['files_modified']}")
    print(f"Total replacements: {results['total_replacements']}")
    print(f"Errors: {len(results['errors'])}")
    
    if results['modified_files']:
        print("\nModified files:")
        for file_info in results['modified_files'][:10]:  # Show first 10
            print(f"  - {file_info['path']} ({file_info['replacements']} replacements)")
        if len(results['modified_files']) > 10:
            print(f"  ... and {len(results['modified_files']) - 10} more")
    
    log_action("Smart migration completed!")
    
    # Special note about .env file
    print("\n" + "="*50)
    print("IMPORTANT: Environment Variables")
    print("="*50)
    print("The .env file has been updated with Firebase configuration.")
    print("Please review the changes and ensure all Firebase credentials are correct:")
    print("  - FIREBASE_PROJECT_ID = web-scroller")
    print("  - FIREBASE_API_KEY = [Your Firebase API Key]")
    print("  - FIREBASE_SERVICE_ACCOUNT_KEY = /app/main/web_app/google_service_key.json")
    print("\nLegacy Supabase variables have been commented out for reference.")
    
    return results

if __name__ == "__main__":
    main()