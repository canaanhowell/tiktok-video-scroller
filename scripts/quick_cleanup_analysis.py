#!/usr/bin/env python3
"""
Quick analysis of files to cleanup in web_app directory
"""
import os
from pathlib import Path
import json
from datetime import datetime

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

def analyze_root_files():
    """Analyze files in root directory that should be organized"""
    web_app_path = Path("/app/main/web_app")
    
    root_files = {
        'documentation': [],
        'deployment': [],
        'config': [],
        'to_delete': [],
        'to_archive': []
    }
    
    # Check root directory files
    for item in web_app_path.iterdir():
        if item.is_file():
            name = item.name.lower()
            
            # Documentation files
            if item.suffix in ['.md', '.txt']:
                if name in ['readme.md', 'license']:
                    continue  # Keep these in root
                elif 'supabase' in name:
                    root_files['to_delete'].append(item.name)
                else:
                    root_files['documentation'].append(item.name)
            
            # Deployment files
            elif name in ['deploy.sh', 'vercel.json']:
                root_files['deployment'].append(item.name)
            
            # Config files
            elif item.suffix in ['.json', '.js', '.ts'] and 'config' in name:
                root_files['config'].append(item.name)
            
            # Files to delete
            elif name in ['supabase', 'supabase-cli.tar.gz', 'cli.tar.gz']:
                root_files['to_delete'].append(item.name)
            
            # Old instructions
            elif 'instructions' in name and 'supabase' in name:
                root_files['to_delete'].append(item.name)
    
    return root_files

def analyze_scripts():
    """Analyze scripts directory for cleanup"""
    scripts_path = Path("/app/main/web_app/scripts")
    
    scripts_analysis = {
        'migration_scripts': [],
        'test_scripts': [],
        'gcloud_scripts': [],
        'firebase_scripts': [],
        'duplicates': []
    }
    
    for item in scripts_path.glob('*.py'):
        name = item.name.lower()
        
        if 'migrate' in name or 'migration' in name:
            scripts_analysis['migration_scripts'].append(item.name)
        elif 'test_' in name:
            scripts_analysis['test_scripts'].append(item.name)
        elif 'gcloud' in name or 'google' in name:
            scripts_analysis['gcloud_scripts'].append(item.name)
        elif 'firebase' in name:
            scripts_analysis['firebase_scripts'].append(item.name)
        
        # Check for versions
        if any(v in name for v in ['_v1', '_v2', '_cv1', '_cv2']):
            scripts_analysis['duplicates'].append(item.name)
    
    return scripts_analysis

def analyze_large_directories():
    """Check size of large directories"""
    web_app_path = Path("/app/main/web_app")
    
    large_dirs = {
        'google-cloud-sdk': None,
        'node_modules': None,
        'backup': None,
        'temp': None,
        'input': None
    }
    
    for dir_name in large_dirs.keys():
        dir_path = web_app_path / dir_name
        if dir_path.exists() and dir_path.is_dir():
            # Quick size check (count files instead of calculating size)
            file_count = sum(1 for _ in dir_path.rglob('*') if _.is_file())
            large_dirs[dir_name] = file_count
    
    return large_dirs

def main():
    """Main execution"""
    log_action("Starting quick cleanup analysis")
    
    # Analyze different aspects
    root_files = analyze_root_files()
    scripts_analysis = analyze_scripts()
    large_dirs = analyze_large_directories()
    
    # Create cleanup plan
    cleanup_plan = {
        'timestamp': datetime.now().isoformat(),
        'root_directory': root_files,
        'scripts': scripts_analysis,
        'large_directories': large_dirs,
        'immediate_actions': {
            'delete_files': [
                'supabase',
                'supabase-cli.tar.gz', 
                'cli.tar.gz',
                'SUPABASE_CLI_INSTRUCTIONS.md',
                'google_instructions.txt',
                'QUICK_DEPLOY.txt',
                'Web_App_Instructions'
            ],
            'move_to_archive': [
                'google-cloud-sdk/',  # Move to /app/tools/
                'temp/',
                'input/'  # Videos should be in cloud storage
            ],
            'organize_scripts': {
                'tests/': scripts_analysis['test_scripts'],
                'archive/': scripts_analysis['migration_scripts'] + scripts_analysis['duplicates'],
                'setup/': scripts_analysis['gcloud_scripts'] + scripts_analysis['firebase_scripts']
            }
        }
    }
    
    # Save plan
    plan_path = Path("/app/main/web_app/logs/quick_cleanup_plan.json")
    with open(plan_path, 'w') as f:
        json.dump(cleanup_plan, f, indent=2)
    
    # Print summary
    print("\n" + "="*60)
    print("🧹 Quick Cleanup Analysis Summary")
    print("="*60)
    
    print("\n📁 Root Directory Files to Organize:")
    print(f"  Documentation: {len(root_files['documentation'])} files")
    print(f"  Deployment: {len(root_files['deployment'])} files")
    print(f"  To Delete: {len(root_files['to_delete'])} files")
    
    print("\n📜 Scripts to Organize:")
    print(f"  Test scripts: {len(scripts_analysis['test_scripts'])} files")
    print(f"  Migration scripts: {len(scripts_analysis['migration_scripts'])} files")
    print(f"  Duplicate versions: {len(scripts_analysis['duplicates'])} files")
    
    print("\n📦 Large Directories:")
    for dir_name, count in large_dirs.items():
        if count:
            print(f"  {dir_name}: {count} files")
    
    print("\n🎯 Immediate Actions:")
    print(f"  Files to delete: {len(cleanup_plan['immediate_actions']['delete_files'])}")
    print(f"  Directories to archive: {len(cleanup_plan['immediate_actions']['move_to_archive'])}")
    
    print(f"\n✅ Cleanup plan saved to: {plan_path}")
    
    log_action("Quick cleanup analysis completed")

if __name__ == "__main__":
    main()