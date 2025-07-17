#!/usr/bin/env python3
"""
Script to install and configure Firebase CLI
"""
import os
import subprocess
import sys
import json
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

def install_nodejs():
    """Install Node.js if not present"""
    log("Checking Node.js installation...")
    
    result = run_command("node --version", check=False)
    if result and result.returncode == 0:
        log(f"Node.js already installed: {result.stdout.strip()}")
        return True
    
    log("Installing Node.js...")
    run_command("apk add --no-cache nodejs npm", check=False)
    
    result = run_command("node --version", check=False)
    if result and result.returncode == 0:
        log(f"Node.js installed successfully: {result.stdout.strip()}")
        return True
    else:
        log("Failed to install Node.js", "ERROR")
        return False

def install_firebase_cli():
    """Install Firebase CLI using npm"""
    log("Installing Firebase CLI...")
    
    # Try to install globally using npm
    result = run_command("npm install -g firebase-tools", check=False)
    
    if result and result.returncode == 0:
        log("Firebase CLI installed successfully")
        
        # Verify installation
        result = run_command("firebase --version", check=False)
        if result and result.returncode == 0:
            log(f"Firebase CLI version: {result.stdout.strip()}")
            return True
    
    # If global install failed, try with npx
    log("Trying alternative installation method...")
    result = run_command("npx firebase-tools --version", check=False)
    if result and result.returncode == 0:
        log("Firebase CLI available via npx")
        
        # Create wrapper script for firebase command
        wrapper_content = '''#!/bin/bash
# Firebase CLI wrapper using npx
exec npx firebase-tools "$@"
'''
        wrapper_path = "/usr/local/bin/firebase"
        with open(wrapper_path, 'w') as f:
            f.write(wrapper_content)
        os.chmod(wrapper_path, 0o755)
        log("Created Firebase wrapper script")
        return True
    
    log("Failed to install Firebase CLI", "ERROR")
    return False

def configure_firebase_auth():
    """Configure Firebase to use service account authentication"""
    log("Configuring Firebase authentication...")
    
    service_key_path = "/app/main/web_app/google_service_key.json"
    
    # Set environment variable for service account
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = service_key_path
    
    # Also set for Firebase
    os.environ['FIREBASE_CONFIG'] = json.dumps({
        "projectId": "web-scroller",
        "serviceAccount": service_key_path
    })
    
    log("Firebase authentication configured with service account")
    
    # Create a persistent config script
    config_script = f'''#!/bin/bash
# Firebase configuration script
export GOOGLE_APPLICATION_CREDENTIALS="{service_key_path}"
export FIREBASE_CONFIG='{{"projectId":"web-scroller","serviceAccount":"{service_key_path}"}}'

echo "Firebase environment configured"
'''
    
    config_path = "/app/main/web_app/scripts/firebase_env.sh"
    with open(config_path, 'w') as f:
        f.write(config_script)
    os.chmod(config_path, 0o755)
    log(f"Created environment config script at {config_path}")

def test_firebase_cli():
    """Test Firebase CLI functionality"""
    log("Testing Firebase CLI...")
    
    # Test basic command
    result = run_command("firebase --version", check=False)
    if not result or result.returncode != 0:
        log("Firebase CLI not working", "ERROR")
        return False
    
    log("Firebase CLI is working!")
    return True

def create_firebase_test_scripts():
    """Create test scripts for Firebase functionality"""
    log("Creating Firebase test scripts...")
    
    # Create initialization script
    init_script = '''#!/bin/bash
# Firebase initialization script

echo "Initializing Firebase for project web-scroller..."

# Set up authentication
export GOOGLE_APPLICATION_CREDENTIALS="/app/main/web_app/google_service_key.json"

# Login using service account
echo "Using service account authentication..."

# Initialize Firebase (non-interactive)
firebase use web-scroller --add 2>/dev/null || echo "Project already configured"

echo "Firebase initialization complete!"
'''
    
    init_path = "/app/main/web_app/scripts/firebase_init.sh"
    with open(init_path, 'w') as f:
        f.write(init_script)
    os.chmod(init_path, 0o755)
    log(f"Created initialization script at {init_path}")
    
    # Create admin test script
    admin_test = '''#!/usr/bin/env python3
"""
Test Firebase Admin SDK capabilities
"""
import os
import json
from datetime import datetime

# Set up authentication
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/app/main/web_app/google_service_key.json'

print("Testing Firebase Admin capabilities...")
print("=" * 50)

# Read service account details
with open('/app/main/web_app/google_service_key.json', 'r') as f:
    service_account = json.load(f)
    
print(f"Project ID: {service_account['project_id']}")
print(f"Service Account: {service_account['client_email']}")

# Test 1: Check if firebase-admin is installed
try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
    print("\\n✓ Firebase Admin SDK is installed")
except ImportError:
    print("\\n✗ Firebase Admin SDK not installed")
    print("  Install with: pip install --break-system-packages firebase-admin")
    exit(1)

# Test 2: Initialize Firebase Admin
try:
    cred = credentials.Certificate('/app/main/web_app/google_service_key.json')
    firebase_admin.initialize_app(cred)
    print("✓ Firebase Admin initialized successfully")
except Exception as e:
    print(f"✗ Failed to initialize Firebase Admin: {str(e)}")
    exit(1)

# Test 3: Test Firestore access
try:
    db = firestore.client()
    print("✓ Firestore client created successfully")
    
    # Try to read a collection (might be empty)
    test_collection = db.collection('test')
    docs = test_collection.limit(1).get()
    print(f"✓ Firestore read test successful (found {len(docs)} documents)")
except Exception as e:
    print(f"✗ Firestore test failed: {str(e)}")

# Test 4: Test Authentication admin capabilities
try:
    # List users (might be empty)
    users = auth.list_users(max_results=1)
    user_count = sum(1 for _ in users.iterate_all())
    print(f"✓ Authentication test successful (found {user_count} users)")
except Exception as e:
    print(f"✗ Authentication test failed: {str(e)}")

print("\\n" + "=" * 50)
print("Admin capabilities test complete!")
'''
    
    admin_path = "/app/main/web_app/scripts/test_firebase_admin.py"
    with open(admin_path, 'w') as f:
        f.write(admin_test)
    os.chmod(admin_path, 0o755)
    log(f"Created admin test script at {admin_path}")
    
    # Create Firebase CLI test script
    cli_test = '''#!/bin/bash
# Test Firebase CLI capabilities

echo "Testing Firebase CLI capabilities..."
echo "=================================="

# Set up authentication
export GOOGLE_APPLICATION_CREDENTIALS="/app/main/web_app/google_service_key.json"

echo -e "\\n1. Firebase CLI version:"
firebase --version

echo -e "\\n2. Current project:"
firebase use

echo -e "\\n3. List Firebase projects:"
firebase projects:list

echo -e "\\n4. Firestore indexes (if any):"
firebase firestore:indexes 2>/dev/null || echo "No Firestore configured yet"

echo -e "\\n5. Firebase services status:"
gcloud services list --enabled | grep -E "firebase|firestore" || echo "Checking Firebase services..."

echo -e "\\nFirebase CLI test complete!"
'''
    
    cli_test_path = "/app/main/web_app/scripts/test_firebase_cli.sh"
    with open(cli_test_path, 'w') as f:
        f.write(cli_test)
    os.chmod(cli_test_path, 0o755)
    log(f"Created CLI test script at {cli_test_path}")

def main():
    """Main installation function"""
    log("=" * 60)
    log("Starting Firebase CLI installation and configuration")
    log("=" * 60)
    
    try:
        # Step 1: Install Node.js
        if not install_nodejs():
            log("Failed to install Node.js", "ERROR")
            return False
        
        # Step 2: Install Firebase CLI
        if not install_firebase_cli():
            log("Failed to install Firebase CLI", "ERROR")
            return False
        
        # Step 3: Configure authentication
        configure_firebase_auth()
        
        # Step 4: Test Firebase CLI
        if not test_firebase_cli():
            log("Firebase CLI test failed", "ERROR")
            return False
        
        # Step 5: Create test scripts
        create_firebase_test_scripts()
        
        log("=" * 60)
        log("SUCCESS! Firebase CLI installed and configured")
        log("=" * 60)
        log("")
        log("Next steps:")
        log("1. Run Firebase initialization: bash /app/main/web_app/scripts/firebase_init.sh")
        log("2. Test CLI capabilities: bash /app/main/web_app/scripts/test_firebase_cli.sh")
        log("3. Test admin capabilities: python /app/main/web_app/scripts/test_firebase_admin.py")
        log("")
        log("Note: You may need to enable Firebase services in Google Cloud Console")
        
        # Update progress
        progress_file = Path("/app/main/web_app/logs/progress.md")
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"### {timestamp} - FIREBASE_CLI\nFirebase CLI installed and configured successfully\n\n---\n\n"
        
        existing_content = ""
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                existing_content = f.read()
        
        with open(progress_file, 'w') as f:
            f.write(entry + existing_content)
        
        return True
        
    except Exception as e:
        log(f"Installation failed: {str(e)}", "ERROR")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)