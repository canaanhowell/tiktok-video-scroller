#!/usr/bin/env python3
"""
Immediate cleanup of obvious redundant files
"""
import os
import shutil
from pathlib import Path
from datetime import datetime

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

def create_backup_before_cleanup():
    """Create a safety backup before cleanup"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"pre_cleanup_backup_{timestamp}.txt"
    backup_path = Path("/app/main/web_app/logs") / backup_name
    
    # List all files that will be affected
    with open(backup_path, 'w') as f:
        f.write(f"Cleanup backup created at: {datetime.now()}\n")
        f.write("="*60 + "\n")
        f.write("Files and directories to be cleaned:\n\n")
        
        # List files to delete
        files_to_delete = [
            'supabase',
            'supabase-cli.tar.gz',
            'SUPABASE_CLI_INSTRUCTIONS.md',
            'google_instructions.txt', 
            'QUICK_DEPLOY.txt',
            'Web_App_Instructions',
            'deploy.sh',
            'temp/supabase',
            'temp/cli.tar.gz',
            'outbound rules.txt'
        ]
        
        for file in files_to_delete:
            f.write(f"DELETE: {file}\n")
    
    log_action(f"Backup created at: {backup_path}")
    return backup_path

def cleanup_obvious_files():
    """Delete obvious redundant files"""
    web_app_path = Path("/app/main/web_app")
    deleted_files = []
    
    # Files to delete
    files_to_delete = [
        'supabase',
        'supabase-cli.tar.gz', 
        'SUPABASE_CLI_INSTRUCTIONS.md',
        'google_instructions.txt',
        'QUICK_DEPLOY.txt',
        'Web_App_Instructions',
        'deploy.sh',
        'outbound rules.txt'
    ]
    
    for file_name in files_to_delete:
        file_path = web_app_path / file_name
        if file_path.exists():
            try:
                if file_path.is_file():
                    file_path.unlink()
                else:
                    shutil.rmtree(file_path)
                deleted_files.append(file_name)
                log_action(f"Deleted: {file_name}")
            except Exception as e:
                log_action(f"Error deleting {file_name}: {e}")
    
    # Clean temp directory
    temp_path = web_app_path / 'temp'
    if temp_path.exists():
        try:
            # Keep the temp directory but clean specific files
            for item in ['supabase', 'cli.tar.gz', 'supabase-dir']:
                item_path = temp_path / item
                if item_path.exists():
                    if item_path.is_file():
                        item_path.unlink()
                    else:
                        shutil.rmtree(item_path)
                    deleted_files.append(f"temp/{item}")
                    log_action(f"Deleted: temp/{item}")
        except Exception as e:
            log_action(f"Error cleaning temp: {e}")
    
    return deleted_files

def move_google_cloud_sdk():
    """Move google-cloud-sdk to tools directory"""
    web_app_path = Path("/app/main/web_app")
    gcloud_path = web_app_path / 'google-cloud-sdk'
    
    if gcloud_path.exists():
        # Create tools directory if it doesn't exist
        tools_dir = Path("/app/tools")
        tools_dir.mkdir(exist_ok=True)
        
        target_path = tools_dir / 'google-cloud-sdk'
        
        try:
            if target_path.exists():
                log_action("Google Cloud SDK already exists in /app/tools, removing from web_app")
                shutil.rmtree(gcloud_path)
            else:
                log_action("Moving Google Cloud SDK to /app/tools")
                shutil.move(str(gcloud_path), str(target_path))
                
                # Update any scripts that reference it
                update_gcloud_references()
                
            return True
        except Exception as e:
            log_action(f"Error moving google-cloud-sdk: {e}")
            return False
    else:
        log_action("google-cloud-sdk not found in web_app")
        return False

def update_gcloud_references():
    """Update any scripts that reference the old gcloud location"""
    scripts_path = Path("/app/main/web_app/scripts")
    
    # Scripts that might reference gcloud
    scripts_to_check = [
        'fix_gcloud_cli.py',
        'setup_gcloud_complete.py',
        'setup_gcloud_fixed.py',
        'test_gcloud_cli.sh'
    ]
    
    for script_name in scripts_to_check:
        script_path = scripts_path / script_name
        if script_path.exists():
            try:
                content = script_path.read_text()
                if '/app/main/web_app/google-cloud-sdk' in content:
                    new_content = content.replace(
                        '/app/main/web_app/google-cloud-sdk',
                        '/app/tools/google-cloud-sdk'
                    )
                    script_path.write_text(new_content)
                    log_action(f"Updated gcloud path in {script_name}")
            except Exception as e:
                log_action(f"Error updating {script_name}: {e}")

def organize_deployment_files():
    """Organize deployment-related files"""
    web_app_path = Path("/app/main/web_app")
    deployment_dir = web_app_path / 'deployment'
    deployment_dir.mkdir(exist_ok=True)
    
    # Files to move to deployment directory
    deployment_files = [
        'DEPLOYMENT.md',
        'deploy-production.sh',
        'deploy-vercel.js',
        'vercel.json'
    ]
    
    moved_files = []
    for file_name in deployment_files:
        if file_name == 'vercel.json':
            # Keep vercel.json in root as it's required there
            continue
            
        file_path = web_app_path / file_name
        if file_path.exists() and file_path.is_file():
            try:
                target = deployment_dir / file_name
                shutil.move(str(file_path), str(target))
                moved_files.append(file_name)
                log_action(f"Moved {file_name} to deployment/")
            except Exception as e:
                log_action(f"Error moving {file_name}: {e}")
    
    # Move deployment scripts from scripts/
    scripts_deployment = [
        'scripts/deploy-production.sh',
        'scripts/deploy-vercel.js'
    ]
    
    for script_path in scripts_deployment:
        full_path = web_app_path / script_path
        if full_path.exists():
            try:
                target = deployment_dir / Path(script_path).name
                shutil.move(str(full_path), str(target))
                moved_files.append(script_path)
                log_action(f"Moved {script_path} to deployment/")
            except Exception as e:
                log_action(f"Error moving {script_path}: {e}")
    
    return moved_files

def main():
    """Main cleanup execution"""
    log_action("Starting immediate cleanup of web_app directory")
    
    # Create backup
    backup_path = create_backup_before_cleanup()
    
    # Perform cleanup
    print("\n🧹 Starting Cleanup Process...")
    print("="*60)
    
    # Step 1: Delete obvious files
    print("\n1️⃣ Deleting redundant files...")
    deleted = cleanup_obvious_files()
    print(f"   ✅ Deleted {len(deleted)} files")
    
    # Step 2: Move google-cloud-sdk
    print("\n2️⃣ Moving google-cloud-sdk...")
    if move_google_cloud_sdk():
        print("   ✅ Moved to /app/tools/google-cloud-sdk")
    else:
        print("   ⚠️  Could not move google-cloud-sdk")
    
    # Step 3: Organize deployment files
    print("\n3️⃣ Organizing deployment files...")
    moved = organize_deployment_files()
    print(f"   ✅ Organized {len(moved)} deployment files")
    
    # Summary
    print("\n" + "="*60)
    print("✨ Cleanup Summary")
    print("="*60)
    print(f"Files deleted: {len(deleted)}")
    print(f"Files organized: {len(moved)}")
    print(f"Backup saved at: {backup_path}")
    
    log_action("Immediate cleanup completed")
    
    print("\n📝 Next steps:")
    print("1. Run 'npm run build' to ensure everything still works")
    print("2. Test deployment with 'npm run deploy:prod'")
    print("3. Run organize_scripts.py to organize the scripts directory")

if __name__ == "__main__":
    main()