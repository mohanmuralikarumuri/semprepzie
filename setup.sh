#!/bin/bash

# Semprepzie v2.0 Setup Script
echo "🚀 Setting up Semprepzie v2.0..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the semprepzie-v2 root directory"
    exit 1
fi

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing shared package dependencies..."
cd shared
npm install
cd ..

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🔨 Building shared package..."
cd shared
npm run build
cd ..

echo "📝 Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please configure your Firebase and email settings"
else
    echo "⚠️  backend/.env already exists"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env - Please configure your Firebase settings"
else
    echo "⚠️  frontend/.env already exists"
fi

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env files with Firebase and email credentials"
echo "2. Run 'npm run dev' to start both frontend and backend"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For detailed setup instructions, see README.md"
