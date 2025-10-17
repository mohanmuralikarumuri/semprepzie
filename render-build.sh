#!/bin/bash

# Render build script optimized for LOW memory (512MB limit)
echo "🚀 Starting optimized build for Render..."

# CRITICAL: Set very low memory limits for 512MB instance
export NODE_OPTIONS="--max-old-space-size=384"

# Build shared package first
echo "📦 Building shared package..."
cd shared && npm run build
cd ..

# Check if frontend dist exists (pre-built and committed)
if [ -d "frontend/dist" ] && [ "$(ls -A frontend/dist)" ]; then
    echo "✅ Using pre-built frontend from dist folder"
else
    # Only build frontend if dist doesn't exist
    echo "⚠️ No pre-built frontend found, building now..."
    echo "🎨 Building frontend with MINIMUM memory..."
    cd frontend
    
    # Use even lower memory for frontend build
    export NODE_OPTIONS="--max-old-space-size=350"
    npm run build:prod
    
    cd ..
fi

# Build backend
echo "⚙️ Building backend..."
cd backend
export NODE_OPTIONS="--max-old-space-size=384"
npm run build
cd ..

# Copy frontend dist to backend public
echo "📁 Copying frontend build to backend..."
mkdir -p backend/public
cp -r frontend/dist/* backend/public/ 2>/dev/null || echo "Warning: Could not copy frontend dist"

echo "✅ Build completed successfully!"
