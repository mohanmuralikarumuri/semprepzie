# Lab System Installation Guide

## Overview
The Semprepzie Lab System provides an integrated development environment for C, Java, and Python programming with real-time code execution capabilities.

## Features
✅ **Multi-Language Support**: C, Java, Python  
✅ **Dark Theme Editor**: Black background with white text  
✅ **Real-time Code Execution**  
✅ **Admin Panel**: Add subjects and code snippets  
✅ **Copy Highlighting**: Blue highlight when copying code  
✅ **Error Display**: Red text for compilation/runtime errors  
✅ **Python Libraries**: NumPy, Pandas, Matplotlib support  

## System Requirements

### For Python Programming
```bash
# Install Python 3.8+
python --version

# Install required libraries
pip install numpy pandas matplotlib scipy requests
```

### For C Programming
```bash
# Windows (install MinGW or Visual Studio Build Tools)
gcc --version

# Linux/macOS
sudo apt-get install gcc  # Ubuntu/Debian
brew install gcc          # macOS
```

### For Java Programming
```bash
# Install JDK 11+
java --version
javac --version
```

## Usage

### For Students
1. Navigate to **Lab** section from the dashboard
2. Select a programming subject (C, Java, or Python)
3. Choose a code example or template
4. Edit code in the dark theme editor
5. Use **Ctrl+Enter** or click **Run Code** to execute
6. View output in the right panel
7. Copy code (will highlight in blue)

### For Admins
1. Click **Admin Panel** button in the lab section
2. **Create New Subject**: Add programming subjects
3. **Add Code**: Create templates and examples for subjects
4. Set language, tags, and descriptions
5. Mark as template for student use

## Code Editor Features
- **Theme**: Black background, white text
- **Error Highlighting**: Red underlines for errors
- **Copy Highlighting**: Blue flash when copying code
- **Syntax Highlighting**: Language-specific colors
- **Line Numbers**: Visible line numbers
- **Auto-completion**: Smart code suggestions
- **Multiple Language Support**: C, Java, Python

## Python Libraries Available
```python
import numpy as np           # Numerical computing
import pandas as pd          # Data analysis
import matplotlib.pyplot as plt  # Plotting
import scipy                 # Scientific computing
import requests             # HTTP requests
import json                 # JSON handling
import os, sys              # System operations
import math                 # Mathematical functions
```

## Sample Programs Included

### Python - Data Science
```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# NumPy arrays
arr = np.array([1, 2, 3, 4, 5])
print(f"Array: {arr}")
print(f"Sum: {np.sum(arr)}")

# Pandas DataFrame
data = {'Name': ['Alice', 'Bob'], 'Age': [25, 30]}
df = pd.DataFrame(data)
print(df)
```

### C Programming
```c
#include <stdio.h>
#include <math.h>

int main() {
    printf("Hello, C Programming!\n");
    
    float a = 15.5, b = 4.2;
    printf("Addition: %.2f + %.2f = %.2f\n", a, b, a + b);
    printf("Square root: %.2f\n", sqrt(a));
    
    return 0;
}
```

### Java Programming
```java
public class Calculator {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        
        double x = 12.5, y = 4.0;
        System.out.println("Addition: " + (x + y));
        System.out.println("Power: " + Math.pow(x, y));
    }
}
```

## API Endpoints

### Lab Management
- `GET /api/lab/subjects` - Get all subjects
- `GET /api/lab/subjects/:id` - Get specific subject with codes
- `POST /api/lab/subjects` - Create subject (Admin only)
- `POST /api/lab/save` - Save code to subject (Admin only)
- `POST /api/lab/execute` - Execute code

### Authentication
All lab endpoints require authentication token in header:
```
Authorization: Bearer <token>
```

## Troubleshooting

### Code Execution Issues
1. **Python not found**: Install Python and add to PATH
2. **C compilation fails**: Install GCC compiler
3. **Java compilation fails**: Install JDK and verify JAVA_HOME
4. **Permission denied**: Check file system permissions
5. **Timeout errors**: Code execution limit is 30 seconds

### Editor Issues
1. **Code highlighting not working**: Check if language is properly selected
2. **Copy highlighting not showing**: Ensure you're copying selected text
3. **Dark theme not applied**: Refresh the page

### Network Issues
1. **Lab not loading**: Check if backend is running on port 3001
2. **Code execution fails**: Verify API endpoint connectivity
3. **Admin panel not accessible**: Confirm admin role in user profile

## Security Features
- **Authentication Required**: All endpoints require valid JWT token
- **Role-based Access**: Admin features restricted to admin users
- **Code Sandboxing**: Code execution in isolated environment
- **Timeout Protection**: 30-second execution limit
- **File Cleanup**: Temporary files automatically removed

## Contributing
To add new programming languages or features:
1. Update `LAB_CONFIG` in shared constants
2. Add language extension in `CodeEditor.tsx`
3. Implement compiler in `lab.controller.ts`
4. Update UI components as needed

---

**Semprepzie Lab System v2.0.0**  
*Advanced Programming Lab for Educational Institutions*