#!/usr/bin/env python3
"""
Replace all .env.local references with .env
"""
import os
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

# Files to process (excluding backups and node_modules)
files_to_process = [
    './DEPLOYMENT.md',
    './deploy.sh',
    './deployment/DEPLOYMENT.md',
    './deployment/deploy-production.sh',
    './deployment/deploy-vercel.js',
    './docs/DEPLOYMENT_GUIDE.md',
    './docs/cli_summary.md',
    './docs/current_tech_stack.md',
    './docs/deprecated_supabase_DEPLOYMENT_GUIDE.md',
    './docs/services_status.md',
    './docs/verified-service-connections.md',
    './scripts/backup_and_init.py',
    './scripts/database/SETUP_INSTRUCTIONS.md',
    './scripts/database/apply_with_node.js',
    './scripts/database/auth_explanation.md',
    './scripts/database/check_keys.js',
    './scripts/database/deploy_schema.js',
    './scripts/database/deploy_schema_fixed.js',
    './scripts/database/deploy_via_rest_api.js',
    './scripts/database/deploy_via_sql_endpoint.js',
    './scripts/database/deploy_with_secret.js',
    './scripts/database/final_deploy.js',
    './scripts/database/setup_new_keys.md',
    './scripts/database/test_connection.js',
    './scripts/database/test_supabase_connection.py',
    './scripts/database/test_supabase_curl.py',
    './scripts/database/verify_project.md',
    './scripts/deploy-production.sh',
    './scripts/deploy-vercel.js',
    './scripts/init_nextjs_v2.py',
    './scripts/migrate_supabase_to_firebase.py',
    './scripts/service-config.js',
    './scripts/smart_firebase_migration.py',
    './scripts/test-all-services.js',
    './scripts/test-api.js',
    './scripts/test_scoring.py',
    './scripts/upload-input-videos.js',
    './tests/test_bunny_api_debug.py'
]

def replace_env_local(file_path):
    """Replace .env.local with .env in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count replacements
        count = content.count('.env.local')
        
        if count > 0:
            # Replace all occurrences
            new_content = content.replace('.env.local', '.env')
            
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            return count
        return 0
    except Exception as e:
        log_action(f"Error processing {file_path}: {e}")
        return 0

def main():
    """Main execution"""
    log_action("Starting .env.local to .env replacement")
    
    total_replacements = 0
    files_modified = 0
    
    for file_path in files_to_process:
        if os.path.exists(file_path):
            count = replace_env_local(file_path)
            if count > 0:
                files_modified += 1
                total_replacements += count
                log_action(f"Replaced {count} occurrences in {file_path}")
    
    # Summary
    print(f"\n✅ Replacement Complete!")
    print(f"Files modified: {files_modified}")
    print(f"Total replacements: {total_replacements}")
    
    log_action(f"Completed .env.local replacement: {files_modified} files, {total_replacements} replacements")

if __name__ == "__main__":
    main()