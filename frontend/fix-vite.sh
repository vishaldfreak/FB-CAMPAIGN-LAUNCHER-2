#!/bin/bash
# Fix Vite optimization cache issues

echo "🔧 Fixing Vite cache issues..."

cd "$(dirname "$0")"

# Kill any running dev server
echo "1. Stopping any running dev server..."
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true

# Clear all caches
echo "2. Clearing Vite caches..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Reinstall if needed (optional)
# echo "3. Reinstalling dependencies..."
# npm install

echo "✅ Done! Now run: npm run dev"
