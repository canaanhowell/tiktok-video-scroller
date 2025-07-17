#!/usr/bin/env python3
"""
Install Google Cloud CLI in Docker environment
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

def install_gcloud_docker():
    """Install Google Cloud CLI in Docker environment"""
    log_action("Starting Google Cloud CLI installation for Docker environment")
    
    # Check if gcloud is already installed
    check_cmd = "which gcloud"
    result = subprocess.run(check_cmd, shell=True, capture_output=True)
    
    if result.returncode == 0:
        log_action("Google Cloud CLI is already installed")
        log_action(f"Location: {result.stdout.decode().strip()}")
        
        # Check version
        run_command("gcloud version", "Check gcloud version")
        return True
    
    # Install Google Cloud CLI using wget
    log_action("Google Cloud CLI not found. Installing...")
    
    # Create installation directory
    install_dir = Path("/app/google-cloud-sdk")
    install_dir.mkdir(exist_ok=True)
    
    # Download and install using wget
    install_commands = [
        "cd /app",
        "wget -q https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz",
        "tar -xzf google-cloud-cli-linux-x86_64.tar.gz",
        "./google-cloud-sdk/install.sh --quiet --path-update=false",
        "rm google-cloud-cli-linux-x86_64.tar.gz"
    ]
    
    for cmd in install_commands:
        if not run_command(cmd, f"Execute: {cmd}"):
            log_error(f"Failed at step: {cmd}")
            return False
    
    # Add gcloud to PATH for current session
    gcloud_path = "/app/google-cloud-sdk/bin"
    os.environ["PATH"] = f"{gcloud_path}:{os.environ.get('PATH', '')}"
    
    # Create a wrapper script to make gcloud accessible
    wrapper_script = """#!/bin/bash
export PATH="/app/google-cloud-sdk/bin:$PATH"
exec /app/google-cloud-sdk/bin/gcloud "$@"
"""
    
    wrapper_path = Path("/usr/local/bin/gcloud")
    try:
        wrapper_path.write_text(wrapper_script)
        wrapper_path.chmod(0o755)
        log_action("Created gcloud wrapper script")
    except Exception as e:
        log_error(f"Failed to create wrapper script: {e}")
    
    # Verify installation
    run_command("/app/google-cloud-sdk/bin/gcloud version", "Verify gcloud installation")
    
    log_build_status("SUCCESS", "Google Cloud CLI installation completed")
    return True

def configure_gcloud():
    """Configure Google Cloud CLI with credentials from .env"""
    log_action("Configuring Google Cloud CLI with credentials")
    
    # Read credentials from .env
    env_file = Path("/app/main/web_app/.env")
    if not env_file.exists():
        log_error(".env file not found")
        return False
    
    credentials = {}
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                credentials[key.strip()] = value.strip()
    
    # Extract Google Cloud credentials
    google_account = credentials.get('google_admin_account')
    google_password = credentials.get('google_admin_account_password')
    
    if not google_account:
        log_error("Google Cloud credentials not found in .env")
        return False
    
    log_action(f"Found Google Cloud account: {google_account}")
    
    # Set up non-interactive authentication
    # First, disable prompts
    run_command("/app/google-cloud-sdk/bin/gcloud config set core/disable_prompts true", "Disable prompts")
    run_command("/app/google-cloud-sdk/bin/gcloud config set survey/disable_prompts true", "Disable survey prompts")
    
    # For service account or user authentication, we'll need to use different approaches
    log_action("Note: Interactive authentication is required for user accounts")
    log_action("For automated authentication, consider using a service account key file")
    
    # Show current configuration
    run_command("/app/google-cloud-sdk/bin/gcloud config list", "Show current configuration")
    
    return True

def main():
    """Main function"""
    log_action("=== Google Cloud CLI Installation Script (Docker) ===")
    
    # Install gcloud
    if not install_gcloud_docker():
        log_error("Installation failed. Please check the logs for details.")
        sys.exit(1)
    
    # Configure gcloud
    configure_gcloud()
    
    log_build_status("SUCCESS", "Google Cloud CLI is ready to use")
    log_action("To authenticate, run: /app/google-cloud-sdk/bin/gcloud auth login")
    log_action("Or use a service account key: /app/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=KEY_FILE")

if __name__ == "__main__":
    main()