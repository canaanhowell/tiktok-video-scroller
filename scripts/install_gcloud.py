#!/usr/bin/env python3
"""
Install Google Cloud CLI
"""

import os
import sys
import subprocess
from pathlib import Path
from logger import log_action, log_error, log_build_status

def run_command(cmd, description):
    """Run a shell command and log the result"""
    log_action(f"Running: {description}")
    log_action(f"Command: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            log_build_status("SUCCESS", f"{description} completed")
            if result.stdout:
                log_action(f"Output: {result.stdout.strip()}")
            return True
        else:
            log_error(f"{description} failed")
            log_error(f"Error: {result.stderr}")
            return False
    except Exception as e:
        log_error(f"Exception during {description}: {str(e)}")
        return False

def install_gcloud():
    """Install Google Cloud CLI"""
    log_action("Starting Google Cloud CLI installation")
    
    # Check if gcloud is already installed
    check_cmd = "which gcloud"
    result = subprocess.run(check_cmd, shell=True, capture_output=True)
    
    if result.returncode == 0:
        log_action("Google Cloud CLI is already installed")
        log_action(f"Location: {result.stdout.decode().strip()}")
        
        # Check version
        run_command("gcloud version", "Check gcloud version")
        return True
    
    # Install Google Cloud CLI using the official installation script
    log_action("Google Cloud CLI not found. Installing...")
    
    # Download and run the installation script
    install_script = """
    # Add the Cloud SDK distribution URI as a package source
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
    
    # Import the Google Cloud public key
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
    
    # Update and install the Cloud SDK
    sudo apt-get update && sudo apt-get install -y google-cloud-cli
    """
    
    # Alternative method using snap if apt fails
    snap_install = "sudo snap install google-cloud-cli --classic"
    
    # Try apt installation first
    success = run_command(install_script, "Install Google Cloud CLI via apt")
    
    if not success:
        log_action("Apt installation failed, trying snap...")
        success = run_command(snap_install, "Install Google Cloud CLI via snap")
    
    if not success:
        log_action("Snap installation failed, trying direct download...")
        # Direct download method
        direct_install = """
        cd /tmp
        curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
        tar -xf google-cloud-cli-linux-x86_64.tar.gz
        ./google-cloud-sdk/install.sh --quiet
        """
        success = run_command(direct_install, "Install Google Cloud CLI via direct download")
        
        if success:
            # Add to PATH
            run_command("echo 'export PATH=$PATH:/tmp/google-cloud-sdk/bin' >> ~/.bashrc", "Add gcloud to PATH")
            run_command("source ~/.bashrc", "Reload bash configuration")
    
    if success:
        # Verify installation
        run_command("gcloud version", "Verify gcloud installation")
        log_build_status("SUCCESS", "Google Cloud CLI installation completed")
        return True
    else:
        log_error("Failed to install Google Cloud CLI")
        return False

def main():
    """Main function"""
    log_action("=== Google Cloud CLI Installation Script ===")
    
    success = install_gcloud()
    
    if success:
        log_build_status("SUCCESS", "Google Cloud CLI is ready to use")
        log_action("Next step: Configure authentication with credentials from .env")
    else:
        log_error("Installation failed. Please check the logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()