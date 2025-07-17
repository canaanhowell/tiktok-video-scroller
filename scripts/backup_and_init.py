#!/usr/bin/env python3
"""
Backup important files and initialize Next.js project
"""

import os
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# Add parent directory to path for logger
import sys
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_file_operation

def backup_files():
    """Backup important files before Next.js init"""
    backup_dir = Path(__file__).parent.parent / "backup" / f"pre_nextjs_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # Files to backup
    important_files = [
        ".env",
        ".env.example",
        ".gitignore",
        "README.md",
        "vercel.json",
        "Web_App_Instructions"
    ]
    
    # Directories to backup
    important_dirs = [
        "docs",
        "scripts",
        "logs"
    ]
    
    log_action(f"Creating backup in {backup_dir}")
    
    # Backup files
    for file in important_files:
        src = Path(__file__).parent.parent / file
        if src.exists():
            dst = backup_dir / file
            shutil.copy2(src, dst)
            log_file_operation("backup", str(dst), True)
    
    # Backup directories
    for dir_name in important_dirs:
        src = Path(__file__).parent.parent / dir_name
        if src.exists():
            dst = backup_dir / dir_name
            shutil.copytree(src, dst)
            log_file_operation("backup", str(dst), True)
    
    log_action(f"Backup completed in {backup_dir}")
    return backup_dir

def clean_directory():
    """Remove conflicting files for Next.js init"""
    base_dir = Path(__file__).parent.parent
    
    # Files to temporarily remove
    temp_remove = [
        "README.md",
        "config",
        "public", 
        "src",
        "tests"
    ]
    
    for item in temp_remove:
        path = base_dir / item
        if path.exists():
            if path.is_file():
                os.remove(path)
            else:
                shutil.rmtree(path)
            log_action(f"Temporarily removed {item}")

def restore_files(backup_dir):
    """Restore important files after Next.js init"""
    base_dir = Path(__file__).parent.parent
    
    # Files to restore
    restore_items = [
        ".env",
        ".env.example",
        "vercel.json",
        "Web_App_Instructions",
        "docs",
        "scripts",
        "logs"
    ]
    
    for item in restore_items:
        src = backup_dir / item
        dst = base_dir / item
        
        if src.exists():
            if src.is_file():
                shutil.copy2(src, dst)
            else:
                if dst.exists():
                    shutil.rmtree(dst)
                shutil.copytree(src, dst)
            log_file_operation("restore", str(dst), True)

def init_nextjs():
    """Initialize Next.js project"""
    log_action("Initializing Next.js with TypeScript, Tailwind, and App Router")
    
    cmd = [
        "npx", "create-next-app@latest", ".",
        "--typescript",
        "--tailwind", 
        "--app",
        "--src-dir",
        "--import-alias", "@/*",
        "--no-install"
    ]
    
    # Run with automatic yes to prompts
    env = os.environ.copy()
    env["NEXT_TELEMETRY_DISABLED"] = "1"
    
    result = subprocess.run(cmd, env=env, capture_output=True, text=True, input="y\n")
    
    if result.returncode == 0:
        log_action("Next.js initialized successfully")
        return True
    else:
        log_error(f"Next.js initialization failed: {result.stderr}")
        return False

def merge_gitignore():
    """Merge our gitignore with Next.js gitignore"""
    base_dir = Path(__file__).parent.parent
    our_gitignore = base_dir / ".gitignore.backup"
    next_gitignore = base_dir / ".gitignore"
    
    if our_gitignore.exists() and next_gitignore.exists():
        # Read both files
        with open(our_gitignore, 'r') as f:
            our_lines = set(f.read().splitlines())
        
        with open(next_gitignore, 'r') as f:
            next_lines = set(f.read().splitlines())
        
        # Merge unique lines
        all_lines = sorted(our_lines | next_lines)
        
        # Write merged content
        with open(next_gitignore, 'w') as f:
            f.write('\n'.join(all_lines))
        
        log_action("Merged .gitignore files")

def main():
    """Main initialization process"""
    log_action("=== Next.js Project Initialization ===")
    
    # 1. Backup important files
    backup_dir = backup_files()
    
    # 2. Backup our gitignore
    base_dir = Path(__file__).parent.parent
    gitignore = base_dir / ".gitignore"
    if gitignore.exists():
        shutil.copy2(gitignore, base_dir / ".gitignore.backup")
    
    # 3. Clean directory
    clean_directory()
    
    # 4. Initialize Next.js
    if init_nextjs():
        # 5. Restore our files
        restore_files(backup_dir)
        
        # 6. Merge gitignore files
        merge_gitignore()
        
        # 7. Clean up backup gitignore
        backup_gitignore = base_dir / ".gitignore.backup"
        if backup_gitignore.exists():
            os.remove(backup_gitignore)
        
        log_action("=== Next.js Initialization Complete ===")
        log_action("Next step: npm install")
        return True
    else:
        log_error("Failed to initialize Next.js")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)