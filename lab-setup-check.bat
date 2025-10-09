@echo off
echo =====================================
echo   Semprepzie Lab System Setup Check
echo =====================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Python is installed
    python --version
    echo.
    echo Checking Python libraries...
    python -c "import numpy; print('[✓] NumPy:', numpy.__version__)" 2>nul || echo [✗] NumPy not installed
    python -c "import pandas; print('[✓] Pandas:', pandas.__version__)" 2>nul || echo [✗] Pandas not installed
    python -c "import matplotlib; print('[✓] Matplotlib:', matplotlib.__version__)" 2>nul || echo [✗] Matplotlib not installed
) else (
    echo [✗] Python not found
    echo Please install Python from https://python.org
)

echo.
echo Checking C compiler...
gcc --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] GCC is installed
    gcc --version | findstr /R "gcc"
) else (
    echo [✗] GCC not found
    echo Please install MinGW or Visual Studio Build Tools
)

echo.
echo Checking Java compiler...
javac -version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Java compiler is installed
    javac -version
    java --version | findstr /R "java"
) else (
    echo [✗] Java compiler not found
    echo Please install JDK from https://openjdk.org
)

echo.
echo =====================================
echo   Installation Commands (if needed)
echo =====================================
echo.
echo For Python libraries:
echo   pip install numpy pandas matplotlib scipy requests
echo.
echo For MinGW (C compiler):
echo   Download from: https://www.mingw-w64.org/downloads/
echo.
echo For Java JDK:
echo   Download from: https://openjdk.org/install/
echo.
echo =====================================
echo   Starting Semprepzie Application
echo =====================================
echo.

if exist "package.json" (
    echo Starting development servers...
    npm run dev
) else (
    echo Error: package.json not found
    echo Please run this script from the project root directory
    pause
)