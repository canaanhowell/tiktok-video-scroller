# Python Dependencies for Web App Project

This document lists all Python packages and modules used throughout the codebase, based on analysis of all Python scripts (*.py) in the project.

## Standard Library Modules (Built-in)
These modules come with Python and don't need to be installed:

- **os** - Operating system interface
- **sys** - System-specific parameters and functions
- **json** - JSON encoder and decoder
- **datetime** - Date and time handling
- **pathlib** (Path) - Object-oriented filesystem paths
- **subprocess** - Subprocess management
- **shutil** - High-level file operations
- **re** - Regular expressions
- **urllib.request** - URL handling modules
- **urllib.error** - Exception classes for urllib

## Third-Party Packages
These packages need to be installed via pip:

### Google Cloud & Firebase
- **google-cloud-storage** - Google Cloud Storage client library
  - Used in: `test_google_connection.py`
  - Install: `pip install google-cloud-storage`

- **firebase-admin** - Firebase Admin Python SDK
  - Used in: `test_firebase_admin.py`, `setup_firestore_database.py`, `test_firebase_admin_complete.py`
  - Install: `pip install firebase-admin`

### Database
- **supabase** - Supabase Python client
  - Used in: `test_supabase_python.py`
  - Install: `pip install supabase`

### HTTP Requests
- **requests** - HTTP library
  - Used in: `test_bunny_api_debug.py`
  - Install: `pip install requests`

## Installation Commands

To install all third-party dependencies:

```bash
# Install individually
pip install google-cloud-storage
pip install firebase-admin
pip install supabase
pip install requests

# Or install all at once
pip install google-cloud-storage firebase-admin supabase requests
```

## Package Versions (Recommended)

While the scripts don't specify exact versions, here are recommended versions for stability:

```
google-cloud-storage>=2.10.0
firebase-admin>=6.1.0
supabase>=2.0.0
requests>=2.31.0
```

## Requirements File

Create a `requirements.txt` file with:

```
google-cloud-storage>=2.10.0
firebase-admin>=6.1.0
supabase>=2.0.0
requests>=2.31.0
```

Then install with: `pip install -r requirements.txt`

## Notes

1. The codebase is transitioning from Supabase to Firebase, so the `supabase` package may be deprecated in future versions.

2. Some scripts use `--break-system-packages` flag when installing packages, which suggests they're running in a containerized or isolated environment.

3. The project includes custom logging functionality in `scripts/logger.py` that doesn't require any external dependencies.

4. Many scripts are utility/migration scripts that may only be run once during setup or migration processes.