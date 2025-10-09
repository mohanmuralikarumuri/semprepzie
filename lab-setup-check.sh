#!/bin/bash

echo "====================================="
echo "  Semprepzie Lab System Setup Check"
echo "====================================="
echo

echo "Checking Python installation..."
if command -v python3 &> /dev/null; then
    echo "[✓] Python is installed"
    python3 --version
    echo
    echo "Checking Python libraries..."
    python3 -c "import numpy; print('[✓] NumPy:', numpy.__version__)" 2>/dev/null || echo "[✗] NumPy not installed"
    python3 -c "import pandas; print('[✓] Pandas:', pandas.__version__)" 2>/dev/null || echo "[✗] Pandas not installed"
    python3 -c "import matplotlib; print('[✓] Matplotlib:', matplotlib.__version__)" 2>/dev/null || echo "[✗] Matplotlib not installed"
elif command -v python &> /dev/null; then
    echo "[✓] Python is installed"
    python --version
    echo
    echo "Checking Python libraries..."
    python -c "import numpy; print('[✓] NumPy:', numpy.__version__)" 2>/dev/null || echo "[✗] NumPy not installed"
    python -c "import pandas; print('[✓] Pandas:', pandas.__version__)" 2>/dev/null || echo "[✗] Pandas not installed"
    python -c "import matplotlib; print('[✓] Matplotlib:', matplotlib.__version__)" 2>/dev/null || echo "[✗] Matplotlib not installed"
else
    echo "[✗] Python not found"
    echo "Please install Python from https://python.org"
fi

echo
echo "Checking C compiler..."
if command -v gcc &> /dev/null; then
    echo "[✓] GCC is installed"
    gcc --version | head -1
else
    echo "[✗] GCC not found"
    echo "Please install GCC:"
    echo "  Ubuntu/Debian: sudo apt-get install gcc"
    echo "  macOS: brew install gcc"
    echo "  CentOS/RHEL: sudo yum install gcc"
fi

echo
echo "Checking Java compiler..."
if command -v javac &> /dev/null; then
    echo "[✓] Java compiler is installed"
    javac -version
    java --version | head -1
else
    echo "[✗] Java compiler not found"
    echo "Please install JDK:"
    echo "  Ubuntu/Debian: sudo apt-get install openjdk-11-jdk"
    echo "  macOS: brew install openjdk@11"
    echo "  Or download from: https://openjdk.org/install/"
fi

echo
echo "====================================="
echo "  Installation Commands (if needed)"
echo "====================================="
echo
echo "For Python libraries:"
echo "  pip3 install numpy pandas matplotlib scipy requests"
echo "  # or"
echo "  pip install numpy pandas matplotlib scipy requests"
echo
echo "For GCC (C compiler):"
echo "  Ubuntu/Debian: sudo apt-get install build-essential gcc"
echo "  macOS: xcode-select --install"
echo "  CentOS/RHEL: sudo yum groupinstall 'Development Tools'"
echo
echo "For Java JDK:"
echo "  Ubuntu/Debian: sudo apt-get install openjdk-11-jdk"
echo "  macOS: brew install openjdk@11"
echo "  Or download from: https://openjdk.org/install/"
echo
echo "====================================="
echo "  Starting Semprepzie Application"
echo "====================================="
echo

if [ -f "package.json" ]; then
    echo "Starting development servers..."
    npm run dev
else
    echo "Error: package.json not found"
    echo "Please run this script from the project root directory"
    read -p "Press Enter to continue..."
fi