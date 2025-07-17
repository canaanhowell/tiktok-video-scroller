#!/usr/bin/env python3
"""
Complete Google Cloud Setup Script
Handles virtual environment creation and authentication
"""

import os
import sys
import subprocess
import json
from pathlib import Path

# Add parent directory to path to import logger
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_build_status

def run_command(cmd, description, cwd=None):
    """Run a shell command and log the result"""
    log_action(f"Running: {description}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        if result.returncode == 0:
            if result.stdout.strip():
                log_action(f"Output: {result.stdout.strip()}")
            return True
        else:
            log_error(f"{description} failed")
            if result.stderr:
                log_error(f"Error: {result.stderr}")
            return False
    except Exception as e:
        log_error(f"Exception during {description}: {str(e)}")
        return False

def create_auth_script():
    """Create authentication script that can be run later"""
    auth_script_content = """#!/usr/bin/env python3
import os
import json
import base64

# Read credentials from .env
env_file = "/app/main/web_app/.env"
creds = {}

with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if line and '=' in line and not line.startswith('#'):
            key, value = line.split('=', 1)
            creds[key.strip()] = value.strip()

email = creds.get('google_admin_account', '')
password = creds.get('google_admin_account_password', '')

print(f"Google Cloud Account: {email}")
print()
print("Authentication Instructions:")
print("=" * 50)
print()
print("Option 1: Interactive Browser Login (Recommended)")
print("-" * 50)
print("Run the following command:")
print(f"  gcloud auth login --account={email}")
print()
print("This will open a browser for authentication.")
print()
print("Option 2: Service Account (For Automation)")
print("-" * 50)
print("1. Go to Google Cloud Console")
print("2. Create a service account")
print("3. Download the JSON key file")
print("4. Run: gcloud auth activate-service-account --key-file=/path/to/key.json")
print()
print("Option 3: Application Default Credentials")
print("-" * 50)
print("Run: gcloud auth application-default login")
print()
print("Current gcloud configuration:")
print("-" * 50)
os.system("gcloud config list")
"""
    
    script_path = Path("/app/gcloud_auth_info.py")
    script_path.write_text(auth_script_content)
    script_path.chmod(0o755)
    log_action(f"Created authentication info script: {script_path}")

def main():
    """Main setup function"""
    log_action("=== Complete Google Cloud Setup ===")
    
    # Check if we're in a container that might have gcloud pre-installed
    gcloud_locations = [
        "/usr/bin/gcloud",
        "/usr/local/bin/gcloud",
        "gcloud"  # Check PATH
    ]
    
    gcloud_found = False
    for loc in gcloud_locations:
        result = subprocess.run(f"which {loc}", shell=True, capture_output=True)
        if result.returncode == 0:
            gcloud_path = result.stdout.decode().strip()
            log_action(f"Found gcloud at: {gcloud_path}")
            gcloud_found = True
            break
    
    if not gcloud_found:
        log_action("gcloud CLI not found. Attempting minimal installation...")
        
        # Try to download just the gcloud binary
        install_cmds = [
            "mkdir -p /app/gcloud-minimal",
            "cd /app/gcloud-minimal && wget -q -O gcloud.tar.gz https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz",
            "cd /app/gcloud-minimal && tar -xzf gcloud.tar.gz --strip-components=1 google-cloud-sdk/bin/gcloud",
            "chmod +x /app/gcloud-minimal/gcloud",
            "ln -sf /app/gcloud-minimal/gcloud /usr/local/bin/gcloud"
        ]
        
        for cmd in install_cmds:
            if not run_command(cmd, f"Execute: {cmd.split('&&')[-1].strip() if '&&' in cmd else cmd}"):
                log_error("Failed to install gcloud minimal")
                break
        
        # Check if installation succeeded
        result = subprocess.run("which gcloud", shell=True, capture_output=True)
        if result.returncode == 0:
            gcloud_found = True
            log_build_status("SUCCESS", "gcloud CLI installed successfully")
    
    # Create authentication info script
    create_auth_script()
    
    # Log final status
    if gcloud_found:
        log_build_status("SUCCESS", "Google Cloud CLI is available")
        log_action("Authentication info script created at: /app/gcloud_auth_info.py")
        log_action("Run 'python /app/gcloud_auth_info.py' for authentication instructions")
        
        # Try to show version
        run_command("gcloud version 2>/dev/null || echo 'Version check failed'", "Check gcloud version")
    else:
        log_error("Could not install gcloud CLI")
        log_action("You may need to install it manually or use a different container image")

if __name__ == "__main__":
    main()