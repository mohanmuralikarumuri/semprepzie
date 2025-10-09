@echo off
echo.
echo ========================================
echo   SEMPREPZIE LAB SYSTEM SETUP CHECKER
echo ========================================
echo.

echo Checking required compilers...
echo.

:: Check Python
echo [1/3] Checking Python 3...
python --version >nul 2>&1
if %errorlevel% == 0 (
    python --version
    echo ✅ Python is installed
    
    echo Checking Python libraries...
    python -c "import numpy, pandas, matplotlib; print('✅ All required libraries are installed')" 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Some Python libraries are missing
        echo Run: pip install numpy pandas matplotlib scipy requests
    )
) else (
    echo ❌ Python is not installed or not in PATH
    echo Download from: https://www.python.org/downloads/
)

echo.

:: Check GCC
echo [2/3] Checking GCC (C Compiler)...
gcc --version >nul 2>&1
if %errorlevel% == 0 (
    gcc --version | findstr gcc
    echo ✅ GCC is installed
) else (
    echo ❌ GCC is not installed or not in PATH
    echo Install MinGW-w64 or Visual Studio with C++ tools
)

echo.

:: Check Java
echo [3/3] Checking Java JDK...
javac -version >nul 2>&1
if %errorlevel% == 0 (
    javac -version 2>&1
    java -version 2>&1 | findstr "version"
    echo ✅ Java JDK is installed
) else (
    echo ❌ Java JDK is not installed or not in PATH
    echo Download from: https://www.oracle.com/java/technologies/downloads/
)

echo.
echo ========================================
echo   SETUP CHECK COMPLETE
echo ========================================
echo.

if exist "node_modules" (
    echo 📦 Node.js dependencies are installed
) else (
    echo ❌ Please run "npm install" first
)

echo.
echo To start the lab system, run: npm run dev
echo For setup help, see: LAB_SETUP_GUIDE.md
echo.
pause