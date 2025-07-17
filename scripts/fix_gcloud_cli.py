#!/usr/bin/env python3
"""
Script to fix Google Cloud CLI installation
"""
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

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

def install_gcloud_dependencies():
    """Install all dependencies needed by gcloud"""
    log("Installing gcloud dependencies...")
    
    # List of Python packages that gcloud might need
    packages = [
        "six",
        "pysocks",
        "httplib2",
        "google-auth",
        "google-api-python-client",
        "google-cloud-core",
        "crcmod",
        "pyopenssl"
    ]
    
    for package in packages:
        log(f"Installing {package}...")
        run_command(f"pip install --break-system-packages {package}", check=False)
    
    log("Dependencies installed")

def create_gcloud_wrapper():
    """Create a working gcloud wrapper script"""
    log("Creating gcloud wrapper script...")
    
    wrapper_content = '''#!/bin/bash
# Google Cloud CLI wrapper with proper environment setup

# Set up Python path to include system packages
export PYTHONPATH=/usr/lib/python3.12/site-packages:$PYTHONPATH

# Set Google Cloud SDK root
export CLOUDSDK_ROOT_DIR=/app/google-cloud-sdk

# Add gcloud components to PATH
export PATH=$CLOUDSDK_ROOT_DIR/bin:$PATH

# Set Python executable
export CLOUDSDK_PYTHON=/usr/bin/python3

# Disable update checks
export CLOUDSDK_CORE_DISABLE_PROMPTS=1
export CLOUDSDK_SURVEY_DISABLE=1

# Run the actual gcloud command
exec $CLOUDSDK_ROOT_DIR/bin/gcloud "$@"
'''
    
    wrapper_path = "/usr/local/bin/gcloud"
    with open(wrapper_path, 'w') as f:
        f.write(wrapper_content)
    
    os.chmod(wrapper_path, 0o755)
    log(f"Created wrapper at {wrapper_path}")
    
    # Also create wrappers for gsutil and bq
    for tool in ['gsutil', 'bq']:
        tool_wrapper = wrapper_content.replace('bin/gcloud', f'bin/{tool}')
        tool_path = f"/usr/local/bin/{tool}"
        with open(tool_path, 'w') as f:
            f.write(tool_wrapper)
        os.chmod(tool_path, 0o755)
        log(f"Created wrapper for {tool}")

def test_gcloud():
    """Test if gcloud works"""
    log("Testing gcloud installation...")
    
    # Test version
    result = run_command("gcloud version", check=False)
    if result and result.returncode == 0:
        log("gcloud version command successful!")
        return True
    else:
        log("gcloud version command failed", "ERROR")
        return False

def configure_gcloud():
    """Configure gcloud with service account"""
    service_key_path = "/app/main/web_app/google_service_key.json"
    
    if not os.path.exists(service_key_path):
        log(f"Service key not found at {service_key_path}", "ERROR")
        return False
    
    log("Configuring gcloud with service account...")
    
    # Set core properties
    run_command("gcloud config set core/disable_prompts true", check=False)
    run_command("gcloud config set survey/disable_prompts true", check=False)
    
    # Activate service account
    result = run_command(f"gcloud auth activate-service-account --key-file={service_key_path}", check=False)
    
    if result and result.returncode == 0:
        log("Service account activated successfully!")
        
        # Set project
        import json
        with open(service_key_path, 'r') as f:
            service_key = json.load(f)
            project_id = service_key.get('project_id')
        
        if project_id:
            run_command(f"gcloud config set project {project_id}", check=False)
            log(f"Set project to {project_id}")
        
        # Test authentication
        result = run_command("gcloud auth list", check=False)
        if result and result.returncode == 0:
            log("Authentication configured successfully!")
            return True
    
    log("Failed to configure authentication", "ERROR")
    return False

def create_test_script():
    """Create a test script for gcloud"""
    test_script = '''#!/bin/bash
# Test script for Google Cloud CLI

echo "Testing Google Cloud CLI..."
echo "=========================="

echo -e "\\n1. gcloud version:"
gcloud version

echo -e "\\n2. Current configuration:"
gcloud config list

echo -e "\\n3. Authentication status:"
gcloud auth list

echo -e "\\n4. Available projects:"
gcloud projects list 2>/dev/null || echo "No projects available or no permissions"

echo -e "\\n5. Storage buckets:"
gcloud storage buckets list 2>/dev/null || echo "No buckets available or no permissions"

echo -e "\\nGoogle Cloud CLI is working!"
'''
    
    test_path = "/app/main/web_app/scripts/test_gcloud_cli.sh"
    with open(test_path, 'w') as f:
        f.write(test_script)
    os.chmod(test_path, 0o755)
    log(f"Created test script at {test_path}")

def main():
    """Main function"""
    log("=" * 60)
    log("Starting Google Cloud CLI fix")
    log("=" * 60)
    
    try:
        # Install dependencies
        install_gcloud_dependencies()
        
        # Create wrapper scripts
        create_gcloud_wrapper()
        
        # Test gcloud
        if test_gcloud():
            log("gcloud is working!")
            
            # Configure authentication
            if configure_gcloud():
                log("gcloud is fully configured!")
                
                # Create test script
                create_test_script()
                
                log("=" * 60)
                log("SUCCESS! Google Cloud CLI is fixed and ready to use")
                log("Run the test script: bash /app/main/web_app/scripts/test_gcloud_cli.sh")
                log("=" * 60)
                
                # Update progress
                progress_file = Path("/app/main/web_app/logs/progress.md")
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                entry = f"### {timestamp} - GCLOUD_CLI_FIXED\nGoogle Cloud CLI successfully fixed and configured\n\n---\n\n"
                
                existing_content = ""
                if progress_file.exists():
                    with open(progress_file, 'r') as f:
                        existing_content = f.read()
                
                with open(progress_file, 'w') as f:
                    f.write(entry + existing_content)
                
                return True
        else:
            log("Failed to fix gcloud", "ERROR")
            return False
            
    except Exception as e:
        log(f"Error during fix: {str(e)}", "ERROR")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)