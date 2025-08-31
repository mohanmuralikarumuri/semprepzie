#!/bin/bash

# Render build script optimized for memory usage
echo "🚀 Starting optimized build for Render..."

# Set memory limits for Node.js
export NODE_OPTIONS="--max-old-space-size=512"

# Build shared package first
echo "📦 Building shared package..."
cd shared && npm run build
cd ..

# Build frontend with memory optimization
echo "🎨 Building frontend with memory optimization..."
cd frontend

# Use production build script with memory limits
npm run build:prod

cd ..

# Build backend
echo "⚙️ Building backend..."
cd backend && npm run build
cd ..

# Copy frontend dist to backend public
echo "📁 Copying frontend build to backend..."
cp -r frontend/dist/* backend/public/ 2>/dev/null || true

echo "✅ Build completed successfully!"
