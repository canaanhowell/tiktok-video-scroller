#!/usr/bin/env python3
"""
Test script to verify Supabase to Firebase migration
"""
import os
from pathlib import Path
import json

def search_for_supabase(directory, max_results=20):
    """Search for any remaining Supabase references"""
    results = []
    extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.env']
    skip_dirs = ['node_modules', '.git', '.next', 'backup', 'deprecated']
    
    for root, dirs, files in os.walk(directory):
        # Skip certain directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = Path(root) / file
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.split('\n')
                    
                    # Search for Supabase references
                    for i, line in enumerate(lines, 1):
                        if any(term in line.lower() for term in ['supabase', 'postgres', 'rls']):
                            results.append({
                                'file': str(file_path),
                                'line': i,
                                'content': line.strip()
                            })
                            
                            if len(results) >= max_results:
                                return results
                except:
                    pass
    
    return results

def check_environment_files():
    """Check for environment variable updates"""
    env_files = [
        '/app/main/web_app/.env',
        '/app/main/web_app/.env.local',
        '/app/main/web_app/.env.production'
    ]
    
    env_issues = []
    
    for env_file in env_files:
        if Path(env_file).exists():
            with open(env_file, 'r') as f:
                content = f.read()
                
            # Check for old Supabase variables
            old_vars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
            for var in old_vars:
                if var in content:
                    env_issues.append(f"{env_file}: Still contains {var}")
            
            # Check for new Firebase variables
            new_vars = ['FIREBASE_CONFIG', 'FIREBASE_API_KEY']
            for var in new_vars:
                if var not in content:
                    env_issues.append(f"{env_file}: Missing {var}")
    
    return env_issues

def verify_imports():
    """Verify that imports have been updated"""
    import_issues = []
    
    # Check source files
    src_dir = Path("/app/main/web_app/src")
    if src_dir.exists():
        for file_path in src_dir.rglob("*.{ts,tsx,js,jsx}"):
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check for old imports
                if '@supabase/supabase-js' in content:
                    import_issues.append(f"{file_path}: Still importing @supabase/supabase-js")
                
                # Check for new imports
                if 'createClient' in content and 'firebase' not in content:
                    import_issues.append(f"{file_path}: Using createClient without Firebase")
            except:
                pass
    
    return import_issues

def main():
    """Run all verification tests"""
    print("Firebase Migration Verification")
    print("=" * 50)
    
    # Test 1: Search for remaining Supabase references
    print("\n1. Searching for remaining Supabase references...")
    web_app_dir = Path("/app/main/web_app")
    remaining = search_for_supabase(web_app_dir)
    
    if remaining:
        print(f"   Found {len(remaining)} potential Supabase references:")
        for ref in remaining[:5]:  # Show first 5
            print(f"   - {ref['file']}:{ref['line']}")
            print(f"     {ref['content'][:80]}...")
    else:
        print("   ✓ No Supabase references found!")
    
    # Test 2: Check environment files
    print("\n2. Checking environment variables...")
    env_issues = check_environment_files()
    
    if env_issues:
        print(f"   Found {len(env_issues)} environment issues:")
        for issue in env_issues:
            print(f"   - {issue}")
    else:
        print("   ✓ Environment variables look good!")
    
    # Test 3: Verify imports
    print("\n3. Verifying import statements...")
    import_issues = verify_imports()
    
    if import_issues:
        print(f"   Found {len(import_issues)} import issues:")
        for issue in import_issues[:5]:
            print(f"   - {issue}")
    else:
        print("   ✓ Import statements updated!")
    
    # Test 4: Check migration report
    print("\n4. Checking migration report...")
    report_path = Path("/app/main/web_app/logs/firebase_migration_report.json")
    
    if report_path.exists():
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        print(f"   Migration completed on: {report['migration_date']}")
        print(f"   Files modified: {report['files_modified']}")
        print(f"   Total replacements: {report['total_replacements']}")
    else:
        print("   No migration report found")
    
    # Summary
    print("\n" + "=" * 50)
    total_issues = len(remaining) + len(env_issues) + len(import_issues)
    
    if total_issues == 0:
        print("✓ Migration verification PASSED!")
        print("All Supabase references have been replaced with Firebase.")
    else:
        print(f"⚠ Migration verification found {total_issues} issues")
        print("Please run the migration script or fix manually.")
    
    return total_issues == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)