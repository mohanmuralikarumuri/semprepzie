@echo off
REM Semprepzie v2.0 Windows Setup Script
echo 🚀 Setting up Semprepzie v2.0...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the semprepzie-v2 root directory
    exit /b 1
)

echo 📦 Installing root dependencies...
call npm install

echo 📦 Installing shared package dependencies...
cd shared
call npm install
cd ..

echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 🔨 Building shared package...
cd shared
call npm run build
cd ..

echo 📝 Setting up environment files...

REM Backend environment
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend/.env - Please configure your Firebase and email settings
) else (
    echo ⚠️  backend/.env already exists
)

REM Frontend environment
if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo ✅ Created frontend/.env - Please configure your Firebase settings
) else (
    echo ⚠️  frontend/.env already exists
)

echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Configure your .env files with Firebase and email credentials
echo 2. Run 'npm run dev' to start both frontend and backend
echo 3. Open http://localhost:5173 in your browser
echo.
echo 📚 For detailed setup instructions, see README.md

pause
