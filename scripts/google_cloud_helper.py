#!/usr/bin/env python3
"""
Google Cloud Helper Script
Provides easy access to Google Cloud services using Python SDK
"""
import os
import json
from pathlib import Path
from datetime import datetime

# Set up authentication
SERVICE_KEY_PATH = "/app/main/web_app/google_service_key.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = SERVICE_KEY_PATH

class GoogleCloudHelper:
    """Helper class for Google Cloud operations"""
    
    def __init__(self):
        """Initialize the helper with service account"""
        self.service_key_path = SERVICE_KEY_PATH
        self._validate_credentials()
        
    def _validate_credentials(self):
        """Validate service account credentials"""
        if not os.path.exists(self.service_key_path):
            raise FileNotFoundError(f"Service key not found at: {self.service_key_path}")
        
        with open(self.service_key_path, 'r') as f:
            self.service_key = json.load(f)
            
        self.project_id = self.service_key.get('project_id')
        self.service_account = self.service_key.get('client_email')
        
        print(f"Initialized Google Cloud Helper")
        print(f"Project: {self.project_id}")
        print(f"Service Account: {self.service_account}")
    
    def get_storage_client(self):
        """Get Google Cloud Storage client"""
        try:
            from google.cloud import storage
            return storage.Client()
        except ImportError:
            print("ERROR: google-cloud-storage not installed")
            print("Run: pip install --break-system-packages google-cloud-storage")
            return None
    
    def list_buckets(self):
        """List all storage buckets"""
        client = self.get_storage_client()
        if not client:
            return []
        
        buckets = list(client.list_buckets())
        print(f"Found {len(buckets)} buckets:")
        for bucket in buckets:
            print(f"  - {bucket.name}")
        return buckets
    
    def create_bucket(self, bucket_name, location="US"):
        """Create a new storage bucket"""
        client = self.get_storage_client()
        if not client:
            return None
        
        try:
            bucket = client.create_bucket(bucket_name, location=location)
            print(f"Created bucket: {bucket.name} in {location}")
            return bucket
        except Exception as e:
            print(f"Failed to create bucket: {str(e)}")
            return None
    
    def upload_file(self, bucket_name, source_file_path, destination_blob_name=None):
        """Upload a file to a bucket"""
        client = self.get_storage_client()
        if not client:
            return False
        
        try:
            bucket = client.bucket(bucket_name)
            
            if destination_blob_name is None:
                destination_blob_name = Path(source_file_path).name
            
            blob = bucket.blob(destination_blob_name)
            blob.upload_from_filename(source_file_path)
            
            print(f"Uploaded {source_file_path} to gs://{bucket_name}/{destination_blob_name}")
            return True
        except Exception as e:
            print(f"Failed to upload file: {str(e)}")
            return False
    
    def download_file(self, bucket_name, source_blob_name, destination_file_path):
        """Download a file from a bucket"""
        client = self.get_storage_client()
        if not client:
            return False
        
        try:
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(source_blob_name)
            blob.download_to_filename(destination_file_path)
            
            print(f"Downloaded gs://{bucket_name}/{source_blob_name} to {destination_file_path}")
            return True
        except Exception as e:
            print(f"Failed to download file: {str(e)}")
            return False
    
    def list_files(self, bucket_name, prefix=None):
        """List files in a bucket"""
        client = self.get_storage_client()
        if not client:
            return []
        
        try:
            bucket = client.bucket(bucket_name)
            blobs = list(bucket.list_blobs(prefix=prefix))
            
            print(f"Found {len(blobs)} files in {bucket_name}:")
            for blob in blobs[:10]:  # Show first 10
                print(f"  - {blob.name}")
            
            if len(blobs) > 10:
                print(f"  ... and {len(blobs) - 10} more")
            
            return blobs
        except Exception as e:
            print(f"Failed to list files: {str(e)}")
            return []
    
    def generate_signed_url(self, bucket_name, blob_name, expiration_minutes=60):
        """Generate a signed URL for temporary access"""
        client = self.get_storage_client()
        if not client:
            return None
        
        try:
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            
            url = blob.generate_signed_url(
                expiration=datetime.timedelta(minutes=expiration_minutes),
                method='GET'
            )
            
            print(f"Generated signed URL (expires in {expiration_minutes} minutes):")
            print(url)
            return url
        except Exception as e:
            print(f"Failed to generate signed URL: {str(e)}")
            return None

def main():
    """Example usage of GoogleCloudHelper"""
    print("Google Cloud Helper - Example Usage")
    print("=" * 50)
    
    # Initialize helper
    helper = GoogleCloudHelper()
    
    # List buckets
    print("\nListing buckets...")
    helper.list_buckets()
    
    print("\nGoogle Cloud Helper is ready to use!")
    print("\nExample usage in your code:")
    print("```python")
    print("from google_cloud_helper import GoogleCloudHelper")
    print("helper = GoogleCloudHelper()")
    print("helper.list_buckets()")
    print("```")

if __name__ == "__main__":
    main()