#!/bin/bash
# Firebase configuration script
export GOOGLE_APPLICATION_CREDENTIALS="/app/main/web_app/google_service_key.json"
export FIREBASE_CONFIG='{"projectId":"web-scroller","serviceAccount":"/app/main/web_app/google_service_key.json"}'

echo "Firebase environment configured"
