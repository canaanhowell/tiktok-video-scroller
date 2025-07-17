#!/usr/bin/env python3
"""
Install Google Cloud SDK using pip
"""

import os
import sys
import subprocess
from pathlib import Path
from logger import log_action, log_error, log_build_status, log_package_installed

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

def install_google_cloud_sdk():
    """Install Google Cloud SDK components via pip"""
    log_action("Installing Google Cloud SDK components via pip")
    
    # List of Google Cloud packages to install
    packages = [
        "google-cloud-storage",
        "google-cloud-compute",
        "google-auth",
        "google-auth-oauthlib",
        "google-auth-httplib2"
    ]
    
    for package in packages:
        if run_command(f"pip install {package}", f"Install {package}"):
            log_package_installed(package)
        else:
            log_error(f"Failed to install {package}")
            return False
    
    return True

def create_gcloud_auth_script():
    """Create a Python script for Google Cloud authentication"""
    auth_script = """#!/usr/bin/env python3
\"\"\"
Google Cloud Authentication Helper
\"\"\"

import os
import json
from google.auth import credentials
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

def authenticate_with_credentials(email, password=None):
    \"\"\"
    Note: Direct password authentication is not supported by Google Cloud.
    This function provides guidance on proper authentication methods.
    \"\"\"
    print(f"Account email: {email}")
    print()
    print("Google Cloud authentication options:")
    print("1. Browser-based OAuth2 flow (recommended for user accounts)")
    print("2. Service account key file (recommended for automation)")
    print("3. Application Default Credentials (ADC)")
    print()
    print("To authenticate with your user account:")
    print("  Run: gcloud auth login")
    print()
    print("To use a service account:")
    print("  1. Create a service account in Google Cloud Console")
    print("  2. Download the key file")
    print("  3. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/keyfile.json")
    print()
    
    return None

def setup_application_default_credentials():
    \"\"\"Set up Application Default Credentials\"\"\"
    print("Setting up Application Default Credentials...")
    print("Run: gcloud auth application-default login")
    
if __name__ == "__main__":
    # Read credentials from .env
    env_file = "/app/main/web_app/.env"
    credentials_dict = {}
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    credentials_dict[key.strip()] = value.strip()
    
    email = credentials_dict.get('google_admin_account')
    password = credentials_dict.get('google_admin_account_password')
    
    if email:
        authenticate_with_credentials(email, password)
    else:
        print("No Google Cloud credentials found in .env file")
"""
    
    script_path = Path("/app/main/web_app/scripts/gcloud_auth_helper.py")
    script_path.write_text(auth_script)
    script_path.chmod(0o755)
    log_action(f"Created authentication helper script: {script_path}")
    return True

def check_gcloud_cli():
    """Check if gcloud CLI is available in the system"""
    # Try to find gcloud in common locations
    possible_paths = [
        "/usr/bin/gcloud",
        "/usr/local/bin/gcloud",
        "/opt/google-cloud-sdk/bin/gcloud",
        "/app/google-cloud-sdk/bin/gcloud",
        "~/.local/bin/gcloud"
    ]
    
    for path in possible_paths:
        expanded_path = os.path.expanduser(path)
        if os.path.exists(expanded_path):
            log_action(f"Found gcloud at: {expanded_path}")
            return expanded_path
    
    # Check if gcloud is in PATH
    result = subprocess.run("which gcloud", shell=True, capture_output=True)
    if result.returncode == 0:
        path = result.stdout.decode().strip()
        log_action(f"Found gcloud in PATH: {path}")
        return path
    
    return None

def main():
    """Main function"""
    log_action("=== Google Cloud SDK Installation (Python packages) ===")
    
    # Check if gcloud CLI exists
    gcloud_path = check_gcloud_cli()
    
    if gcloud_path:
        log_action(f"Google Cloud CLI found at: {gcloud_path}")
        run_command(f"{gcloud_path} version", "Check gcloud version")
    else:
        log_action("Google Cloud CLI not found. Installing Python SDK components instead.")
    
    # Install Python packages
    if not install_google_cloud_sdk():
        log_error("Failed to install Google Cloud SDK packages")
        sys.exit(1)
    
    # Create authentication helper
    create_gcloud_auth_script()
    
    log_build_status("SUCCESS", "Google Cloud Python SDK installed successfully")
    log_action("Authentication helper created at: /app/main/web_app/scripts/gcloud_auth_helper.py")
    log_action("Run the helper script for authentication instructions")
    
    # Show installed packages
    run_command("pip list | grep google", "List installed Google packages")

if __name__ == "__main__":
    main()