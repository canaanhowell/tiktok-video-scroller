#!/usr/bin/env python3
"""
Simple script to install and configure Google Cloud CLI
"""
import os
import subprocess
import sys
import json
from datetime import datetime
from pathlib import Path

# Set up logging
LOG_DIR = Path("/app/main/web_app/logs")
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / f"{datetime.now().strftime('%m%d%Y')}.log"

def log(level, message):
    """Simple logging function"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - {level} - {message}"
    print(log_entry)
    
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(log_entry + "\n")
    except Exception as e:
        print(f"Failed to write to log: {e}")

def run_command(cmd, check=True):
    """Run a shell command"""
    try:
        log("INFO", f"Running: {cmd}")
        result = subprocess.run(
            cmd, 
            shell=True, 
            check=check, 
            capture_output=True,
            text=True
        )
        if result.stdout:
            log("INFO", f"Output: {result.stdout.strip()}")
        return result
    except subprocess.CalledProcessError as e:
        log("ERROR", f"Command failed: {cmd}")
        log("ERROR", f"Error: {e.stderr if e.stderr else str(e)}")
        if check:
            raise
        return None

def main():
    """Main installation function"""
    service_key_path = "/app/main/web_app/google_service_key.json"
    
    try:
        log("INFO", "Starting Google Cloud CLI installation")
        
        # Clean up existing installation
        log("INFO", "Cleaning up existing installation")
        run_command("rm -rf /app/google-cloud-sdk", check=False)
        run_command("rm -f /usr/local/bin/gcloud", check=False)
        run_command("rm -f /usr/local/bin/gsutil", check=False)
        run_command("rm -f /usr/local/bin/bq", check=False)
        
        # Change to app directory
        os.chdir("/app")
        
        # Download Google Cloud CLI
        log("INFO", "Downloading Google Cloud CLI")
        run_command("wget -q https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz")
        
        # Extract the archive
        log("INFO", "Extracting Google Cloud CLI")
        run_command("tar -xzf google-cloud-cli-linux-x86_64.tar.gz")
        
        # Install the CLI
        log("INFO", "Installing Google Cloud CLI")
        run_command("./google-cloud-sdk/install.sh --quiet --path-update=false")
        
        # Create symlinks
        log("INFO", "Creating symlinks")
        run_command("ln -sf /app/google-cloud-sdk/bin/gcloud /usr/local/bin/gcloud")
        run_command("ln -sf /app/google-cloud-sdk/bin/gsutil /usr/local/bin/gsutil")
        run_command("ln -sf /app/google-cloud-sdk/bin/bq /usr/local/bin/bq")
        
        # Clean up archive
        run_command("rm -f google-cloud-cli-linux-x86_64.tar.gz", check=False)
        
        # Verify installation
        result = run_command("gcloud version", check=False)
        if not result or result.returncode != 0:
            log("ERROR", "Failed to install Google Cloud CLI")
            return False
        
        log("INFO", "Google Cloud CLI installed successfully")
        
        # Configure gcloud
        log("INFO", "Configuring Google Cloud CLI")
        
        # Check if service key exists
        if not os.path.exists(service_key_path):
            log("ERROR", f"Service key not found at: {service_key_path}")
            return False
        
        # Read service key to get project ID
        with open(service_key_path, 'r') as f:
            service_key = json.load(f)
            project_id = service_key.get('project_id')
        
        if not project_id:
            log("ERROR", "Project ID not found in service key")
            return False
        
        log("INFO", f"Found project ID: {project_id}")
        
        # Disable prompts
        run_command("gcloud config set core/disable_prompts true", check=False)
        run_command("gcloud config set survey/disable_prompts true", check=False)
        
        # Set project
        run_command(f"gcloud config set project {project_id}", check=False)
        
        # Activate service account
        log("INFO", "Activating service account")
        result = run_command(f"gcloud auth activate-service-account --key-file={service_key_path}", check=False)
        
        if not result or result.returncode != 0:
            log("ERROR", "Failed to activate service account")
            return False
        
        log("INFO", "Service account activated successfully")
        
        # Verify authentication
        result = run_command("gcloud auth list", check=False)
        if not result or result.returncode != 0:
            log("ERROR", "Failed to verify authentication")
            return False
        
        # Test connection
        log("INFO", "Testing Google Cloud connection")
        result = run_command("gcloud storage buckets list", check=False)
        
        if result and result.returncode == 0:
            log("INFO", "Google Cloud connection test successful")
        else:
            log("WARNING", "Could not list storage buckets (this might be normal if no buckets exist)")
        
        log("INFO", "Google Cloud CLI setup completed successfully!")
        
        # Update progress file
        progress_file = LOG_DIR / "progress.md"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"### {timestamp} - GCLOUD\nGoogle Cloud CLI installed and configured successfully\n\n---\n\n"
        
        existing_content = ""
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                existing_content = f.read()
        
        with open(progress_file, 'w') as f:
            f.write(entry + existing_content)
        
        return True
        
    except Exception as e:
        log("ERROR", f"Setup failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)