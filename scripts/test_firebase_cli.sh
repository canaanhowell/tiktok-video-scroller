#!/bin/bash
# Test Firebase CLI capabilities

echo "Testing Firebase CLI capabilities..."
echo "=================================="

# Set up authentication
export GOOGLE_APPLICATION_CREDENTIALS="/app/main/web_app/google_service_key.json"

echo -e "\n1. Firebase CLI version:"
firebase --version

echo -e "\n2. Current project:"
firebase use

echo -e "\n3. List Firebase projects:"
firebase projects:list

echo -e "\n4. Firestore indexes (if any):"
firebase firestore:indexes 2>/dev/null || echo "No Firestore configured yet"

echo -e "\n5. Firebase services status:"
gcloud services list --enabled | grep -E "firebase|firestore" || echo "Checking Firebase services..."

echo -e "\nFirebase CLI test complete!"
