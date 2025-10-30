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
echo "⏳ Waiting 15 seconds for Vercel to start build..."
echo ""

# Wait for Vercel to pick up the push and start building
sleep 15

echo "🔍 Checking Vercel deployment status..."
echo ""

# Show deployment list directly (simplest approach)
npx vercel ls --yes | head -25

echo ""
echo "💡 To check for errors: npm run vercel:check"
echo "💡 Or view in Vercel dashboard"
echo ""

