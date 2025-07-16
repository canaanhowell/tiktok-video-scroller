#!/usr/bin/env python3
"""Test if Bunny CDN needs authentication tokens"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Checking Bunny CDN environment variables:")
print("-" * 60)

# Check for token-related env vars
env_vars = [
    'bunny_cdn_streaming_library',
    'bunny_cdn_streaming_key', 
    'bunny_cdn_streaming_hostname',
    'bunny_cdn_api_key',
    'bunny_cdn_storage_zone',
    'bunny_cdn_storage_password'
]

for var in env_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive data
        if 'key' in var.lower() or 'password' in var.lower():
            masked = value[:4] + '...' + value[-4:] if len(value) > 8 else '***'
            print(f"{var}: {masked}")
        else:
            print(f"{var}: {value}")
    else:
        print(f"{var}: Not set")

print("\nPossible issues:")
print("1. Videos might need authentication token in URL")
print("2. CORS might be blocking direct access") 
print("3. Videos might be private/restricted")
print("4. CDN edge might be geo-restricted")