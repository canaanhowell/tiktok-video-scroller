#!/usr/bin/env python3
"""
Analyze the web_app directory structure and identify files for cleanup
"""
import os
import json
from pathlib import Path
from datetime import datetime
import shutil

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

# Define critical directories and files
CRITICAL_PATHS = {
    # Core Next.js files
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'package.json',
    'package-lock.json',
    
    # Source code
    'src/',
    
    # Public assets
    'public/',
    
    # Deployment files
    'vercel.json',
    '.env',
    
    # Google/Firebase config
    'google_service_key.json',
    
    # Node modules
    'node_modules/',
}

# Define files/directories that can be cleaned
CLEANUP_CANDIDATES = {
    # Temporary files
    'temp/',
    'tmp/',
    '*.tmp',
    
    # Backup files (we'll keep backup/ but clean old ones)
    '*_backup_*',
    '*_supabase_backup_*',
    
    # Old migration files
    'migrate_supabase_to_firebase.py',
    'smart_firebase_migration.py',
    
    # CLI tools that should be in separate location
    'google-cloud-sdk/',
    'supabase',
    'supabase-cli.tar.gz',
    'cli.tar.gz',
    
    # Old instructions
    'SUPABASE_CLI_INSTRUCTIONS.md',
    'google_instructions.txt',
    
    # Test/debug files
    'test_*.py',
    'debug_*.py',
    '*_test.js',
    
    # Old deployment files
    'deploy.sh',
    'QUICK_DEPLOY.txt',
    
    # Input files that should be in cloud storage
    'input/',
    
    # Duplicate/redundant docs
    'Web_App_Instructions',
}

# Files to organize into subdirectories
ORGANIZATION_MAP = {
    'deployment': [
        'deploy*.sh',
        'deploy*.js',
        'vercel.json',
        'DEPLOYMENT.md',
    ],
    'config': [
        '*.config.js',
        '*.config.ts',
        'tsconfig.json',
        '.env*',
    ],
    'documentation': [
        '*.md',
        '*.txt',
    ],
}

def get_directory_stats(path):
    """Get statistics about a directory"""
    stats = {
        'total_files': 0,
        'total_dirs': 0,
        'total_size': 0,
        'file_types': {},
        'largest_files': [],
        'duplicate_patterns': {},
    }
    
    for root, dirs, files in os.walk(path):
        stats['total_dirs'] += len(dirs)
        stats['total_files'] += len(files)
        
        for file in files:
            file_path = Path(root) / file
            try:
                size = file_path.stat().st_size
                stats['total_size'] += size
                
                # Track file types
                ext = file_path.suffix.lower()
                stats['file_types'][ext] = stats['file_types'].get(ext, 0) + 1
                
                # Track largest files
                stats['largest_files'].append({
                    'path': str(file_path.relative_to(path)),
                    'size': size
                })
                
                # Check for duplicate patterns
                base_name = file_path.stem
                for pattern in ['backup', 'v1', 'v2', 'old', 'copy', 'test']:
                    if pattern in base_name.lower():
                        stats['duplicate_patterns'][pattern] = stats['duplicate_patterns'].get(pattern, 0) + 1
                        
            except Exception as e:
                log_action(f"Error processing {file_path}: {e}")
    
    # Sort largest files
    stats['largest_files'].sort(key=lambda x: x['size'], reverse=True)
    stats['largest_files'] = stats['largest_files'][:20]  # Top 20
    
    return stats

def analyze_scripts_directory(scripts_path):
    """Analyze scripts directory for redundancy"""
    script_analysis = {
        'database_scripts': [],
        'test_scripts': [],
        'setup_scripts': [],
        'migration_scripts': [],
        'utility_scripts': [],
        'duplicates': []
    }
    
    for file in scripts_path.glob('**/*.py'):
        name = file.name.lower()
        
        if 'database' in str(file) or 'supabase' in name or 'firebase' in name:
            script_analysis['database_scripts'].append(str(file.relative_to(scripts_path)))
        elif 'test' in name:
            script_analysis['test_scripts'].append(str(file.relative_to(scripts_path)))
        elif 'setup' in name or 'install' in name:
            script_analysis['setup_scripts'].append(str(file.relative_to(scripts_path)))
        elif 'migrate' in name or 'migration' in name:
            script_analysis['migration_scripts'].append(str(file.relative_to(scripts_path)))
        else:
            script_analysis['utility_scripts'].append(str(file.relative_to(scripts_path)))
        
        # Check for version patterns
        if any(pattern in name for pattern in ['_v1', '_v2', '_cv1', '_cv2', '_backup']):
            script_analysis['duplicates'].append(str(file.relative_to(scripts_path)))
    
    return script_analysis

def analyze_docs_directory(docs_path):
    """Analyze docs directory for redundancy"""
    docs_analysis = {
        'total_docs': 0,
        'deprecated_docs': [],
        'duplicate_topics': {},
        'index_files': [],
        'backup_files': []
    }
    
    for file in docs_path.glob('**/*.md'):
        docs_analysis['total_docs'] += 1
        name = file.name.lower()
        
        if 'deprecated' in name:
            docs_analysis['deprecated_docs'].append(str(file.relative_to(docs_path)))
        if 'index' in name:
            docs_analysis['index_files'].append(str(file.relative_to(docs_path)))
        if 'backup' in str(file):
            docs_analysis['backup_files'].append(str(file.relative_to(docs_path)))
        
        # Track topic duplicates
        for topic in ['implementation', 'deployment', 'migration', 'setup', 'config']:
            if topic in name:
                if topic not in docs_analysis['duplicate_topics']:
                    docs_analysis['duplicate_topics'][topic] = []
                docs_analysis['duplicate_topics'][topic].append(str(file.relative_to(docs_path)))
    
    return docs_analysis

def generate_cleanup_plan(web_app_path):
    """Generate a comprehensive cleanup plan"""
    log_action("Starting directory structure analysis")
    
    # Get overall stats
    stats = get_directory_stats(web_app_path)
    
    # Analyze specific directories
    scripts_analysis = analyze_scripts_directory(web_app_path / 'scripts')
    docs_analysis = analyze_docs_directory(web_app_path / 'docs')
    
    # Identify files to clean
    cleanup_files = []
    organize_files = {}
    
    for root, dirs, files in os.walk(web_app_path):
        # Skip critical directories
        if any(critical in str(root) for critical in ['node_modules', '.git', '.next', 'src']):
            continue
            
        for file in files:
            file_path = Path(root) / file
            relative_path = file_path.relative_to(web_app_path)
            
            # Check if file should be cleaned
            for pattern in CLEANUP_CANDIDATES:
                if pattern.startswith('*'):
                    if file.endswith(pattern[1:]) or pattern[1:] in file:
                        cleanup_files.append(str(relative_path))
                elif file == pattern:
                    cleanup_files.append(str(relative_path))
            
            # Check if file should be organized
            for category, patterns in ORGANIZATION_MAP.items():
                for pattern in patterns:
                    if pattern.startswith('*'):
                        if file.endswith(pattern[1:]):
                            if category not in organize_files:
                                organize_files[category] = []
                            organize_files[category].append(str(relative_path))
    
    # Create cleanup plan
    cleanup_plan = {
        'analysis_date': datetime.now().isoformat(),
        'directory_stats': stats,
        'scripts_analysis': scripts_analysis,
        'docs_analysis': docs_analysis,
        'cleanup_recommendations': {
            'files_to_delete': cleanup_files,
            'files_to_organize': organize_files,
            'large_files_to_review': stats['largest_files'][:10],
            'duplicate_scripts': scripts_analysis['duplicates'],
            'deprecated_docs': docs_analysis['deprecated_docs'],
        },
        'organization_plan': {
            'create_directories': [
                'archive/',
                'config/',
                'deployment/',
                'documentation/archive/',
                'scripts/archive/',
                'scripts/tests/',
                'scripts/utils/',
                'scripts/setup/',
                'scripts/database/archive/',
            ],
            'move_operations': []
        }
    }
    
    # Generate move operations
    for category, files in organize_files.items():
        for file in files:
            if not any(critical in file for critical in CRITICAL_PATHS):
                cleanup_plan['organization_plan']['move_operations'].append({
                    'from': file,
                    'to': f'{category}/{Path(file).name}'
                })
    
    # Save cleanup plan
    plan_path = web_app_path / 'logs' / 'cleanup_plan.json'
    with open(plan_path, 'w') as f:
        json.dump(cleanup_plan, f, indent=2)
    
    log_action(f"Cleanup plan saved to: {plan_path}")
    
    # Print summary
    print("\n" + "="*60)
    print("Directory Cleanup Analysis Summary")
    print("="*60)
    print(f"Total files: {stats['total_files']}")
    print(f"Total directories: {stats['total_dirs']}")
    print(f"Total size: {stats['total_size'] / (1024*1024):.2f} MB")
    print(f"\nFiles to delete: {len(cleanup_files)}")
    print(f"Files to organize: {sum(len(files) for files in organize_files.values())}")
    print(f"Duplicate scripts found: {len(scripts_analysis['duplicates'])}")
    print(f"Deprecated docs found: {len(docs_analysis['deprecated_docs'])}")
    
    print("\nTop 5 largest files:")
    for file in stats['largest_files'][:5]:
        print(f"  - {file['path']}: {file['size'] / (1024*1024):.2f} MB")
    
    print("\nFile type distribution:")
    for ext, count in sorted(stats['file_types'].items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  - {ext or 'no extension'}: {count} files")
    
    return cleanup_plan

def main():
    """Main execution function"""
    web_app_path = Path("/app/main/web_app")
    
    # Generate cleanup plan
    cleanup_plan = generate_cleanup_plan(web_app_path)
    
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    print("1. Review the cleanup plan at: logs/cleanup_plan.json")
    print("2. Run execute_cleanup.py to perform the cleanup")
    print("3. Verify the application still works after cleanup")
    print("4. Commit the organized structure")
    
    log_action("Directory analysis completed")
    
if __name__ == "__main__":
    main()