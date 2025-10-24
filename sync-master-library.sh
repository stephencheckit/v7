#!/bin/bash

# ============================================================================
# Sync Master Ingredients Library
# ============================================================================
# Run this AFTER applying the SQL migrations
# This syncs the TypeScript master ingredients to the database
# ============================================================================

echo "🔄 Syncing Master Ingredients Library..."
echo ""

# Get the app URL (update this with your actual URL)
APP_URL="http://localhost:3000"

# Check if running locally or production
if [ "$1" != "" ]; then
  APP_URL="$1"
fi

echo "📡 Target: $APP_URL"
echo ""

# Call the sync endpoint
echo "⏳ Calling sync endpoint..."
RESPONSE=$(curl -s -X POST "$APP_URL/api/master-ingredients/sync")

echo ""
echo "📊 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Done!"
echo ""
echo "To check status:"
echo "curl $APP_URL/api/master-ingredients/sync"

