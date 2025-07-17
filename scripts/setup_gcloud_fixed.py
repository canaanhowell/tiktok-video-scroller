#!/usr/bin/env python3
"""
Script to properly install and configure Google Cloud CLI
"""
import os
import subprocess
import sys
import json
import time
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import logger

def run_command(cmd, check=True, shell=True, capture_output=True):
    """Run a shell command and return the result"""
    try:
        logger.log("BUILD", f"Running: {cmd}")
        result = subprocess.run(
            cmd, 
            shell=shell, 
            check=check, 
            capture_output=capture_output,
            text=True
        )
        if result.stdout:
            logger.log("BUILD", f"Output: {result.stdout.strip()}")
        return result
    except subprocess.CalledProcessError as e:
        logger.log("ERROR", f"Command failed: {cmd}")
        logger.log("ERROR", f"Error: {e.stderr if e.stderr else str(e)}")
        if check:
            raise
        return None

def install_gcloud_cli():
    """Install Google Cloud CLI"""
    logger.log("BUILD", "Starting Google Cloud CLI installation")
    
    # Clean up any existing installation
    logger.log("BUILD", "Cleaning up existing installation")
    run_command("rm -rf /app/google-cloud-sdk", check=False)
    run_command("rm -f /usr/local/bin/gcloud", check=False)
    run_command("rm -f /usr/local/bin/gsutil", check=False)
    run_command("rm -f /usr/local/bin/bq", check=False)
    
    # Change to app directory
    os.chdir("/app")
    
    # Download Google Cloud CLI
    logger.log("BUILD", "Downloading Google Cloud CLI")
    run_command("wget -q https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz")
    
    # Extract the archive
    logger.log("BUILD", "Extracting Google Cloud CLI")
    run_command("tar -xzf google-cloud-cli-linux-x86_64.tar.gz")
    
    # Install the CLI
    logger.log("BUILD", "Installing Google Cloud CLI")
    run_command("./google-cloud-sdk/install.sh --quiet --path-update=false")
    
    # Create symlinks
    logger.log("BUILD", "Creating symlinks")
    run_command("ln -sf /app/google-cloud-sdk/bin/gcloud /usr/local/bin/gcloud")
    run_command("ln -sf /app/google-cloud-sdk/bin/gsutil /usr/local/bin/gsutil")
    run_command("ln -sf /app/google-cloud-sdk/bin/bq /usr/local/bin/bq")
    
    # Verify installation
    result = run_command("gcloud version", check=False)
    if result and result.returncode == 0:
        logger.log("BUILD", "Google Cloud CLI installed successfully")
        return True
    else:
        logger.log("ERROR", "Failed to install Google Cloud CLI")
        return False

def configure_gcloud(service_key_path):
    """Configure gcloud with service account"""
    logger.log("BUILD", "Configuring Google Cloud CLI")
    
    # Check if service key exists
    if not os.path.exists(service_key_path):
        logger.log("ERROR", f"Service key not found at: {service_key_path}")
        return False
    
    # Read service key to get project ID
    with open(service_key_path, 'r') as f:
        service_key = json.load(f)
        project_id = service_key.get('project_id')
    
    if not project_id:
        logger.log("ERROR", "Project ID not found in service key")
        return False
    
    logger.log("BUILD", f"Found project ID: {project_id}")
    
    # Disable prompts
    run_command("gcloud config set core/disable_prompts true", check=False)
    run_command("gcloud config set survey/disable_prompts true", check=False)
    
    # Set project
    run_command(f"gcloud config set project {project_id}", check=False)
    
    # Activate service account
    logger.log("BUILD", "Activating service account")
    result = run_command(f"gcloud auth activate-service-account --key-file={service_key_path}", check=False)
    
    if result and result.returncode == 0:
        logger.log("BUILD", "Service account activated successfully")
        
        # Verify authentication
        result = run_command("gcloud auth list", check=False)
        if result and result.returncode == 0:
            logger.log("BUILD", "Authentication verified successfully")
            return True
    
    logger.log("ERROR", "Failed to configure Google Cloud CLI")
    return False

def test_gcloud_connection():
    """Test Google Cloud connection"""
    logger.log("BUILD", "Testing Google Cloud connection")
    
    # List storage buckets as a test
    result = run_command("gcloud storage buckets list", check=False)
    
    if result and result.returncode == 0:
        logger.log("BUILD", "Google Cloud connection test successful")
        return True
    else:
        logger.log("ERROR", "Google Cloud connection test failed")
        return False

def main():
    """Main function"""
    service_key_path = "/app/main/web_app/google_service_key.json"
    
    try:
        # Install Google Cloud CLI
        if not install_gcloud_cli():
            logger.log("ERROR", "Installation failed")
            return False
        
        # Configure with service account
        if not configure_gcloud(service_key_path):
            logger.log("ERROR", "Configuration failed")
            return False
        
        # Test connection
        if not test_gcloud_connection():
            logger.log("ERROR", "Connection test failed")
            return False
        
        logger.log("BUILD", "Google Cloud CLI setup completed successfully!")
        return True
        
    except Exception as e:
        logger.log("ERROR", f"Setup failed: {str(e)}")
        return False
    finally:
        # Clean up
        run_command("rm -f /app/google-cloud-cli-linux-x86_64.tar.gz", check=False)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)