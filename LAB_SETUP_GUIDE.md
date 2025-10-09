# Lab System Compiler Setup Guide

## Required Compilers for Lab System

The Semprepzie Lab System supports **C**, **Java**, and **Python** programming languages. To run code online, you need the following compilers installed on your system:

### 1. Python 3 🐍
**Required for Python programming with data science libraries**

#### Windows Installation:
1. Download Python from [python.org](https://www.python.org/downloads/)
2. Choose Python 3.9+ and check "Add to PATH"
3. Install required libraries:
```bash
pip install numpy pandas matplotlib scipy requests
```

#### Verify Installation:
```bash
python3 --version
python3 -c "import numpy, pandas, matplotlib; print('All libraries installed!')"
```

---

### 2. GCC (C Compiler) ⚙️
**Required for C programming**

#### Windows Installation:
1. Install [MinGW-w64](https://www.mingw-w64.org/downloads/)
2. Or install [Code::Blocks](http://www.codeblocks.org/) with MinGW
3. Add to system PATH

#### Alternative (Recommended for Windows):
Install [Visual Studio Code](https://code.visualstudio.com/) with C/C++ extension

#### Verify Installation:
```bash
gcc --version
```

---

### 3. Java JDK ☕
**Required for Java programming**

#### Windows Installation:
1. Download [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
2. Install JDK 11 or higher
3. Set JAVA_HOME environment variable
4. Add `%JAVA_HOME%\bin` to PATH

#### Verify Installation:
```bash
java --version
javac --version
```

---

## Quick Setup Commands

### Windows (PowerShell as Administrator):
```powershell
# Install Python and libraries
winget install Python.Python.3.12
pip install numpy pandas matplotlib scipy requests

# Install Java
winget install Microsoft.OpenJDK.11

# Install GCC (via Chocolatey)
choco install mingw
```

### Linux (Ubuntu/Debian):
```bash
# Install all compilers
sudo apt update
sudo apt install python3 python3-pip gcc default-jdk

# Install Python libraries
pip3 install numpy pandas matplotlib scipy requests
```

### macOS:
```bash
# Install via Homebrew
brew install python gcc openjdk@11

# Install Python libraries
pip3 install numpy pandas matplotlib scipy requests
```

---

## Features Supported

### ✅ **Python Features:**
- Full NumPy, Pandas, Matplotlib support
- Interactive input/output
- File operations
- All standard Python libraries

### ✅ **C Features:**
- Standard C library functions
- Interactive input/output
- File operations
- Compilation and execution

### ✅ **Java Features:**
- Object-oriented programming
- Standard Java libraries
- Interactive input/output
- Package support

---

## Lab System Features

### 🎨 **Dark Theme Editor**
- Black background with white text
- **Red text** for errors
- **Blue highlighting** for copied code
- Syntax highlighting for all languages

### 🔧 **Admin Features**
- Add new subjects
- Create code templates
- Manage programming exercises
- Track student progress

### 👨‍💻 **Student Features**
- Browse subjects by programming language
- Edit and run code online
- See real-time output
- Copy and download code
- Interactive input support

---

## Troubleshooting

### Common Issues:

1. **"command not found" errors**
   - Ensure compilers are added to system PATH
   - Restart VS Code after installation

2. **Python library import errors**
   - Run: `pip install --upgrade numpy pandas matplotlib`
   - Use `pip3` instead of `pip` on some systems

3. **Java compilation errors**
   - Verify JAVA_HOME is set correctly
   - Check JDK version (minimum Java 11)

4. **C compilation errors**
   - Install complete MinGW package
   - Verify gcc is in PATH

---

## Need Help?

Contact your administrator or check the [documentation](https://github.com/mohanmuralikarumuri/semprepzie) for more details.

**Happy Coding! 🚀**