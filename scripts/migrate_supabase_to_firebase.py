#!/usr/bin/env python3
"""
Script to find and replace all Supabase references with Firebase in the codebase
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

# Define replacements
REPLACEMENTS = {
    # Basic replacements
    'supabase': 'firebase',
    'Supabase': 'Firebase',
    'SUPABASE': 'FIREBASE',
    
    # Specific service replacements
    'supabase.auth': 'firebase.auth',
    'supabase.storage': 'firebase.storage',
    'supabase.from': 'db.collection',
    'supabase.rpc': 'firebase.functions',
    
    # Environment variables
    'NEXT_PUBLIC_SUPABASE_URL': 'NEXT_PUBLIC_FIREBASE_CONFIG',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'NEXT_PUBLIC_FIREBASE_API_KEY',
    'SUPABASE_SERVICE_ROLE_KEY': 'FIREBASE_SERVICE_ACCOUNT_KEY',
    
    # Import statements
    '@supabase/supabase-js': 'firebase/app',
    '@supabase/auth-helpers-react': 'firebase/auth',
    '@supabase/auth-helpers-nextjs': 'firebase/auth',
    
    # Database specific
    'PostgreSQL': 'Firestore',
    'postgres': 'firestore',
    'RLS policies': 'Firestore security rules',
    'Row Level Security': 'Firestore security rules',
    
    # Cache
    'Upstash Redis': 'Firebase Functions caching',
}

# File extensions to process
PROCESSABLE_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', 
    '.env', '.env', '.env.production',
    '.yml', '.yaml', '.sh', '.sql'
]

# Directories to skip
SKIP_DIRS = [
    'node_modules', '.git', '.next', 'dist', 'build',
    '.vercel', 'coverage', '__pycache__', '.pytest_cache',
    'backup', 'deprecated'
]

# Files to skip
SKIP_FILES = [
    'migrate_supabase_to_firebase.py',  # This script
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
]

def create_backup(file_path):
    """Create a backup of the file before modification"""
    backup_dir = Path(file_path).parent / 'backup'
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{Path(file_path).stem}_supabase_backup_{timestamp}{Path(file_path).suffix}"
    backup_path = backup_dir / backup_name
    
    shutil.copy2(file_path, backup_path)
    return backup_path

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

def process_file(file_path):
    """Process a single file and replace Supabase references"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        log_action(f"Error reading {file_path}: {e}")
        return False, 0
    
    original_content = content
    replacement_count = 0
    
    # Apply replacements
    for old, new in REPLACEMENTS.items():
        # Count replacements
        count = content.count(old)
        if count > 0:
            content = content.replace(old, new)
            replacement_count += count
    
    # Special case replacements using regex
    # Replace createClient imports
    content = re.sub(
        r"import\s*{\s*createClient\s*}\s*from\s*['\"]@supabase/supabase-js['\"]",
        "import { initializeApp } from 'firebase/app'",
        content
    )
    
    # Replace Supabase client creation
    content = re.sub(
        r"createClient\s*\([^)]+\)",
        "initializeApp(firebaseConfig)",
        content
    )
    
    # Check if content changed
    if content != original_content:
        # Create backup
        backup_path = create_backup(file_path)
        log_action(f"Created backup: {backup_path}")
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, replacement_count
    
    return False, 0

def find_supabase_references(directory):
    """Find all files containing Supabase references"""
    supabase_files = []
    
    for root, dirs, files in os.walk(directory):
        # Remove skip directories from dirs to prevent walking into them
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for file in files:
            file_path = Path(root) / file
            
            if not should_process_file(file_path):
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if file contains any Supabase reference
                if any(term in content for term in ['supabase', 'Supabase', 'SUPABASE']):
                    supabase_files.append(file_path)
            except Exception as e:
                log_action(f"Error reading {file_path}: {e}")
    
    return supabase_files

def generate_report(results):
    """Generate a migration report"""
    report = {
        "migration_date": datetime.now().isoformat(),
        "total_files_scanned": results['total_scanned'],
        "files_with_supabase": results['files_found'],
        "files_modified": results['files_modified'],
        "total_replacements": results['total_replacements'],
        "modified_files": results['modified_files'],
        "skipped_files": results['skipped_files'],
        "errors": results['errors']
    }
    
    report_path = Path("/app/main/web_app/logs/firebase_migration_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    return report_path

def main():
    """Main migration function"""
    log_action("Starting Supabase to Firebase migration")
    
    # Directory to process
    web_app_dir = Path("/app/main/web_app")
    
    # Find all files with Supabase references
    log_action("Searching for Supabase references...")
    supabase_files = find_supabase_references(web_app_dir)
    log_action(f"Found {len(supabase_files)} files with Supabase references")
    
    # Process results
    results = {
        'total_scanned': 0,
        'files_found': len(supabase_files),
        'files_modified': 0,
        'total_replacements': 0,
        'modified_files': [],
        'skipped_files': [],
        'errors': []
    }
    
    # Process each file
    for file_path in supabase_files:
        log_action(f"Processing: {file_path}")
        
        try:
            modified, count = process_file(file_path)
            results['total_scanned'] += 1
            
            if modified:
                results['files_modified'] += 1
                results['total_replacements'] += count
                results['modified_files'].append({
                    'path': str(file_path),
                    'replacements': count
                })
                log_action(f"Modified {file_path} with {count} replacements")
            else:
                results['skipped_files'].append(str(file_path))
        except Exception as e:
            error_msg = f"Error processing {file_path}: {str(e)}"
            log_action(error_msg)
            results['errors'].append(error_msg)
    
    # Generate report
    report_path = generate_report(results)
    log_action(f"Migration report saved to: {report_path}")
    
    # Print summary
    print("\n" + "="*50)
    print("Supabase to Firebase Migration Summary")
    print("="*50)
    print(f"Files scanned: {results['total_scanned']}")
    print(f"Files with Supabase references: {results['files_found']}")
    print(f"Files modified: {results['files_modified']}")
    print(f"Total replacements: {results['total_replacements']}")
    print(f"Errors: {len(results['errors'])}")
    
    if results['modified_files']:
        print("\nModified files:")
        for file_info in results['modified_files'][:10]:  # Show first 10
            print(f"  - {file_info['path']} ({file_info['replacements']} replacements)")
        if len(results['modified_files']) > 10:
            print(f"  ... and {len(results['modified_files']) - 10} more")
    
    log_action("Migration completed!")
    
    return results

if __name__ == "__main__":
    main()