#!/bin/bash
# Test script for Google Cloud CLI

echo "Testing Google Cloud CLI..."
echo "=========================="

echo -e "\n1. gcloud version:"
gcloud version

echo -e "\n2. Current configuration:"
gcloud config list

echo -e "\n3. Authentication status:"
gcloud auth list

echo -e "\n4. Available projects:"
gcloud projects list 2>/dev/null || echo "No projects available or no permissions"

echo -e "\n5. Storage buckets:"
gcloud storage buckets list 2>/dev/null || echo "No buckets available or no permissions"

echo -e "\nGoogle Cloud CLI is working!"
