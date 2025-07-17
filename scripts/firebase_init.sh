#!/bin/bash
# Firebase initialization script

echo "Initializing Firebase for project web-scroller..."

# Set up authentication
export GOOGLE_APPLICATION_CREDENTIALS="/app/main/web_app/google_service_key.json"

# Login using service account
echo "Using service account authentication..."

# Initialize Firebase (non-interactive)
firebase use web-scroller --add 2>/dev/null || echo "Project already configured"

echo "Firebase initialization complete!"
