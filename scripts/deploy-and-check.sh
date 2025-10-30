#!/bin/bash

# Deploy and automatically check Vercel status
# Usage: npm run deploy:check

echo ""
echo "🚀 Deploying to production..."
echo ""

# Push to GitHub
git push origin main

if [ $? -ne 0 ]; then
  echo "❌ Git push failed"
  exit 1
fi

echo ""
echo "✅ Pushed to GitHub"
echo ""
echo "⏳ Waiting 10 seconds for Vercel to start build..."
echo ""

# Wait for Vercel to pick up the push and start building
sleep 10

echo "🔍 Checking Vercel deployment status..."
echo ""

# Check deployment status
node scripts/check-vercel-deploy.js

echo ""
echo "💡 Tip: If build fails, errors will appear in Problems panel"
echo ""

