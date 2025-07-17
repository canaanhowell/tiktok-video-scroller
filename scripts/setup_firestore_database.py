#!/usr/bin/env python3
"""
Script to create Firestore database in the web-scroller project
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

def create_firestore_database():
    """Create Firestore database in the web-scroller project"""
    log("=" * 60)
    log("Setting up Firestore database for web-scroller project")
    log("=" * 60)
    
    # First, verify we're using the right project
    result = run_command("gcloud config get-value project", check=False)
    if result and result.stdout:
        current_project = result.stdout.strip()
        log(f"Current project: {current_project}")
        
        if current_project != "web-scroller":
            log("Setting project to web-scroller...")
            run_command("gcloud config set project web-scroller")
    
    # Check if Firestore is already created
    log("Checking existing Firestore databases...")
    result = run_command("gcloud firestore databases list --format='value(name)'", check=False)
    
    if result and result.returncode == 0 and result.stdout:
        log("Firestore database already exists:")
        log(result.stdout.strip())
        return True
    
    # Create Firestore database
    log("Creating Firestore database...")
    
    # Firestore requires specifying a location
    # Using us-central (Iowa) as default location
    location = "us-central"
    
    log(f"Creating Firestore database in location: {location}")
    
    # Create the database
    cmd = f"gcloud firestore databases create --location={location} --type=firestore-native"
    result = run_command(cmd, check=False)
    
    if result and result.returncode == 0:
        log("✓ Firestore database created successfully!")
        
        # Verify creation
        result = run_command("gcloud firestore databases list", check=False)
        if result and result.stdout:
            log("Database details:")
            log(result.stdout)
        
        return True
    else:
        # Check if it's a billing issue
        if result and "billing" in result.stderr.lower():
            log("ERROR: Billing must be enabled for the project to create Firestore", "ERROR")
            log("Please enable billing at: https://console.cloud.google.com/billing?project=web-scroller", "ERROR")
        else:
            log("Failed to create Firestore database", "ERROR")
        return False

def setup_firestore_security_rules():
    """Set up basic Firestore security rules"""
    log("Setting up Firestore security rules...")
    
    # Create basic security rules file
    rules_content = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read access to specific collections
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin-only access for sensitive collections
    match /admin/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}"""
    
    rules_path = "/app/main/web_app/firebase_project/firestore.rules"
    with open(rules_path, 'w') as f:
        f.write(rules_content)
    
    log(f"Created Firestore rules at: {rules_path}")
    
    # Create indexes file
    indexes_content = """{
  "indexes": [],
  "fieldOverrides": []
}"""
    
    indexes_path = "/app/main/web_app/firebase_project/firestore.indexes.json"
    with open(indexes_path, 'w') as f:
        f.write(indexes_content)
    
    log(f"Created Firestore indexes at: {indexes_path}")

def create_test_data():
    """Create test data in Firestore"""
    log("Creating test data in Firestore...")
    
    test_script = '''#!/usr/bin/env python3
"""Create test data in Firestore"""
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/app/main/web_app/google_service_key.json'

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin
cred = credentials.Certificate('/app/main/web_app/google_service_key.json')
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

# Create test data
test_data = {
    'created_at': datetime.now(),
    'message': 'Hello from Firebase Admin SDK!',
    'project': 'web-scroller',
    'test': True
}

# Add to test collection
doc_ref = db.collection('test').document('admin_test')
doc_ref.set(test_data)

print("Test data created successfully!")

# Read it back
doc = doc_ref.get()
if doc.exists:
    print(f"Retrieved data: {doc.to_dict()}")
'''
    
    test_data_path = "/app/main/web_app/scripts/create_firestore_test_data.py"
    with open(test_data_path, 'w') as f:
        f.write(test_script)
    
    log(f"Created test data script at: {test_data_path}")

def main():
    """Main setup function"""
    try:
        # Create Firestore database
        if create_firestore_database():
            # Set up security rules
            setup_firestore_security_rules()
            
            # Create test data script
            create_test_data()
            
            log("=" * 60)
            log("SUCCESS! Firestore database setup complete")
            log("=" * 60)
            log("")
            log("Next steps:")
            log("1. Test Firestore: python /app/main/web_app/scripts/create_firestore_test_data.py")
            log("2. Deploy rules: firebase deploy --only firestore:rules")
            log("3. View in console: https://console.firebase.google.com/project/web-scroller/firestore")
            
            # Update progress
            progress_file = Path("/app/main/web_app/logs/progress.md")
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            entry = f"### {timestamp} - FIRESTORE_SETUP\nFirestore database created in web-scroller project\n\n---\n\n"
            
            existing_content = ""
            if progress_file.exists():
                with open(progress_file, 'r') as f:
                    existing_content = f.read()
            
            with open(progress_file, 'w') as f:
                f.write(entry + existing_content)
            
            return True
        else:
            log("Failed to set up Firestore database", "ERROR")
            return False
            
    except Exception as e:
        log(f"Setup failed: {str(e)}", "ERROR")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)