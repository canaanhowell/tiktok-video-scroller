#!/usr/bin/env python3
"""
Script to enable Firebase services in Google Cloud
"""
import subprocess
import sys
from datetime import datetime
from pathlib import Path

def log(message, level="INFO"):
    """Simple logging"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{timestamp} - {level} - {message}")
    
    log_dir = Path("/app/main/web_app/logs")
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"{datetime.now().strftime('%m%d%Y')}.log"
    
    with open(log_file, 'a') as f:
        f.write(f"{timestamp} - {level} - {message}\n")

def run_command(cmd, check=True):
    """Run a command and return result"""
    try:
        log(f"Running: {cmd}")
        result = subprocess.run(
            cmd, 
            shell=True, 
            check=check, 
            capture_output=True,
            text=True
        )
        if result.stdout:
            log(f"Output: {result.stdout.strip()}")
        return result
    except subprocess.CalledProcessError as e:
        log(f"Command failed: {cmd}", "ERROR")
        if e.stderr:
            log(f"Error: {e.stderr}", "ERROR")
        if check:
            raise
        return None

def enable_firebase_services():
    """Enable all necessary Firebase services"""
    log("=" * 60)
    log("Enabling Firebase services in Google Cloud")
    log("=" * 60)
    
    # List of Firebase-related services to enable
    services = [
        "firebase.googleapis.com",           # Firebase Management API
        "firebasehosting.googleapis.com",    # Firebase Hosting API
        "firestore.googleapis.com",          # Cloud Firestore API
        "firebaserules.googleapis.com",      # Firebase Rules API
        "firebasestorage.googleapis.com",    # Firebase Storage
        "identitytoolkit.googleapis.com",    # Firebase Authentication
        "firebaseappcheck.googleapis.com",   # Firebase App Check
        "firebasedatabase.googleapis.com",   # Firebase Realtime Database
        "firebaseinstallations.googleapis.com", # Firebase Installations
        "fcm.googleapis.com",                # Firebase Cloud Messaging
        "firebaseml.googleapis.com",         # Firebase ML
        "firebasedynamiclinks.googleapis.com", # Firebase Dynamic Links
        "cloudfunctions.googleapis.com",     # Cloud Functions (for Firebase Functions)
        "cloudresourcemanager.googleapis.com", # Resource Manager API
        "serviceusage.googleapis.com"        # Service Usage API
    ]
    
    enabled_count = 0
    failed_count = 0
    
    for service in services:
        log(f"Enabling {service}...")
        result = run_command(f"gcloud services enable {service} --quiet", check=False)
        
        if result and result.returncode == 0:
            log(f"✓ Enabled {service}")
            enabled_count += 1
        else:
            log(f"✗ Failed to enable {service}", "WARNING")
            failed_count += 1
    
    log("")
    log(f"Services enabled: {enabled_count}")
    log(f"Services failed: {failed_count}")
    
    # Check which services are now enabled
    log("")
    log("Checking enabled Firebase services...")
    result = run_command(
        'gcloud services list --enabled --filter="name:firebase OR name:firestore OR name:identitytoolkit" --format="table(name,title)"',
        check=False
    )
    
    # Create a summary
    summary = f"""
Firebase Services Setup Summary
==============================

Attempted to enable {len(services)} Firebase services
Successfully enabled: {enabled_count}
Failed to enable: {failed_count}

Note: Some services may fail if:
1. Billing is not enabled on the project
2. The service account doesn't have sufficient permissions
3. The service is already enabled

Next Steps:
1. If billing is required, enable it in the Google Cloud Console
2. Try the Firebase CLI commands again
3. Use the Firebase Admin SDK for programmatic access
"""
    
    print(summary)
    
    # Save summary
    summary_path = Path("/app/main/web_app/logs/firebase_services_summary.txt")
    with open(summary_path, 'w') as f:
        f.write(summary)
    
    log(f"Summary saved to: {summary_path}")
    
    # Update progress
    progress_file = Path("/app/main/web_app/logs/progress.md")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"### {timestamp} - FIREBASE_SERVICES\nAttempted to enable Firebase services (enabled: {enabled_count}, failed: {failed_count})\n\n---\n\n"
    
    existing_content = ""
    if progress_file.exists():
        with open(progress_file, 'r') as f:
            existing_content = f.read()
    
    with open(progress_file, 'w') as f:
        f.write(entry + existing_content)
    
    return enabled_count > 0

if __name__ == "__main__":
    success = enable_firebase_services()
    sys.exit(0 if success else 1)