# Visual Guide: PDF Save Button

## 🎯 Feature Overview

When you click the **Save button (💾)**, a professional PDF is generated and downloaded!

---

## 📄 PDF Layout Visualization

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║            Fibonacci Series Program               ║  ← Title (18pt, Bold, Centered)
║                                                   ║
║  Language: C                                      ║  ← Language Badge (10pt)
║  ─────────────────────────────────────────────    ║  ← Divider Line
║                                                   ║
║  Program:                                         ║  ← Section Header (14pt, Bold)
║  #include <stdio.h>                               ║  ← Code (9pt, Courier)
║                                                   ║
║  int fibonacci(int n) {                           ║
║      if (n <= 1) return n;                        ║
║      return fibonacci(n-1) + fibonacci(n-2);      ║
║  }                                                ║
║                                                   ║
║  int main() {                                     ║
║      int n = 10;                                  ║
║      printf("Fibonacci(%d) = %d\n", n,            ║
║             fibonacci(n));                        ║
║      return 0;                                    ║
║  }                                                ║
║                                                   ║
║  ─────────────────────────────────────────────    ║  ← Divider Line
║                                                   ║
║  Input:                                           ║  ← Section Header (14pt, Bold)
║  10                                               ║  ← Input Text (10pt, Courier)
║                                                   ║
║  ─────────────────────────────────────────────    ║  ← Divider Line
║                                                   ║
║  Output:                                          ║  ← Section Header (14pt, Bold)
║  Fibonacci(10) = 55                               ║  ← Output Text (10pt, Courier)
║                                                   ║
╚═══════════════════════════════════════════════════╝

         Downloaded as: Fibonacci_Series_c_2025-10-16.pdf
```

---

## 🎨 Typography Breakdown

### Title Section
```
┌─────────────────────────────────────┐
│      Fibonacci Series Program       │  Font: Helvetica Bold
│                                     │  Size: 18pt
│         (CENTERED)                  │  Color: Black
└─────────────────────────────────────┘
```

### Language Badge
```
┌─────────────────────────────────────┐
│ Language: C                         │  Font: Helvetica Normal
│                                     │  Size: 10pt
└─────────────────────────────────────┘
```

### Section Headers (Program/Input/Output)
```
┌─────────────────────────────────────┐
│ Program:                            │  Font: Helvetica Bold
│                                     │  Size: 14pt
└─────────────────────────────────────┘
```

### Code Content
```
┌─────────────────────────────────────┐
│ #include <stdio.h>                  │  Font: Courier
│ int main() {                        │  Size: 9pt (program)
│     printf("Hello");                │       10pt (input/output)
│ }                                   │  Preserves: Indentation
└─────────────────────────────────────┘
```

---

## 🔄 Button States

### Before Click (Normal State)
```
┌─────┐
│ 💾  │  ← Save icon
└─────┘
  Hover: Scale 105%, lighter background
```

### After Click (Success State)
```
┌─────┐
│ ✓   │  ← Checkmark icon
└─────┘
  Background: Green
  Duration: 2 seconds
  Then: Returns to save icon
```

---

## 📁 Filename Examples

### Format Pattern:
```
[Title_With_Underscores]_[lang]_[YYYY-MM-DD].pdf
```

### Real Examples:

**C Program:**
```
Hello_World_c_2025-10-16.pdf
```

**C++ Program:**
```
Bubble_Sort_cpp_2025-10-16.pdf
```

**Python Program:**
```
Prime_Numbers_py_2025-10-16.pdf
```

**Program with Spaces:**
```
Input: "Lab Exercise 3"
Output: Lab_Exercise_3_c_2025-10-16.pdf
```

---

## 🎬 User Flow Diagram

```
┌────────────┐
│ User Types │
│    Code    │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ Adds Input │
│ (Optional) │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ Runs Code  │
│ (Optional) │
└─────┬──────┘
      │
      ▼
┌────────────┐
│   Clicks   │
│ 💾 Button  │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  jsPDF     │
│ Generates  │
│    PDF     │
└─────┬──────┘
      │
      ▼
┌────────────┐
│    PDF     │
│ Downloads  │
│ to Device  │
└────────────┘
```

---

## 📊 Content Flow in PDF

```
Page Start (15pt margin)
    ↓
┌─────────────────┐
│  [TITLE]        │  18pt font, bold, centered
└─────────────────┘
    ↓ 15pt spacing
┌─────────────────┐
│  Language: X    │  10pt font, normal
└─────────────────┘
    ↓ 10pt spacing
    ─────────────   Divider line (0.5pt)
    ↓ 10pt spacing
┌─────────────────┐
│  Program:       │  14pt font, bold
└─────────────────┘
    ↓ 8pt spacing
┌─────────────────┐
│  [CODE LINES]   │  9pt Courier font
│  Line 1         │  5pt line height
│  Line 2         │  (auto-paginate if needed)
│  Line 3         │
│  ...            │
└─────────────────┘
    ↓ 10pt spacing
    ─────────────   Divider line
    ↓ 10pt spacing
┌─────────────────┐
│  Input:         │  14pt font, bold
└─────────────────┘
    ↓ 8pt spacing
┌─────────────────┐
│  [INPUT TEXT]   │  10pt Courier font
└─────────────────┘
    ↓ 10pt spacing
    ─────────────   Divider line
    ↓ 10pt spacing
┌─────────────────┐
│  Output:        │  14pt font, bold
└─────────────────┘
    ↓ 8pt spacing
┌─────────────────┐
│  [OUTPUT TEXT]  │  10pt Courier font
└─────────────────┘
    ↓
Page End (15pt margin)
```

---

## 🎨 Empty State Messages

### No Input Provided:
```
┌─────────────────────────────────────┐
│ Input:                              │
│ (No input provided)                 │  ← Italic font
└─────────────────────────────────────┘
```

### No Output Yet:
```
┌─────────────────────────────────────┐
│ Output:                             │
│ (No output yet - Run the program    │  ← Italic font
│  to see output)                     │
└─────────────────────────────────────┘
```

---

## 🔧 Auto-Pagination Logic

```
For each line of code:
    ┌─────────────────────┐
    │ Is yPosition >      │
    │ pageHeight - margin?│
    └──────┬──────────────┘
           │
     ┌─────┴─────┐
    YES          NO
     │            │
     ▼            ▼
┌────────┐   ┌────────┐
│Add New │   │Add Line│
│ Page   │   │  Here  │
└────────┘   └────────┘
     │            │
     └─────┬──────┘
           ▼
    Continue to next line
```

**Result:** Long programs automatically span multiple pages!

---

## 💡 Smart Features

### Tab Conversion:
```
Input Code:
    int main() {
    →   printf("Hello");    ← Tab character
    }

PDF Output:
    int main() {
        printf("Hello");    ← 4 spaces
    }
```

### Title Formatting:
```
Input Title: "Lab Exercise 3: Sorting"
PDF Filename: Lab_Exercise_3_Sorting_c_2025-10-16.pdf
                 ↑              ↑
             Spaces → Underscores
```

### Date Stamping:
```
Current Date: October 16, 2025
PDF Filename: ...._2025-10-16.pdf
                    ↑
              ISO format (YYYY-MM-DD)
```

---

## 🎯 Real-World Example

### Student Use Case:

**Scenario:** Lab assignment submission

**Steps:**
1. Write program for "Sum of Array Elements"
2. Test with input: `5 1 2 3 4 5`
3. Get output: `Sum = 15`
4. Click Save button
5. Get: `Sum_of_Array_Elements_c_2025-10-16.pdf`
6. Upload to learning management system ✓

**PDF Contains:**
```
┌────────────────────────────────────────┐
│      Sum of Array Elements             │
│                                        │
│ Language: C                            │
│ ──────────────────────────────────     │
│                                        │
│ Program:                               │
│ #include <stdio.h>                     │
│ int main() {                           │
│     int n, sum = 0;                    │
│     scanf("%d", &n);                   │
│     for(int i=0; i<n; i++) {           │
│         int x;                         │
│         scanf("%d", &x);               │
│         sum += x;                      │
│     }                                  │
│     printf("Sum = %d\n", sum);         │
│     return 0;                          │
│ }                                      │
│                                        │
│ ──────────────────────────────────     │
│ Input:                                 │
│ 5                                      │
│ 1 2 3 4 5                              │
│                                        │
│ ──────────────────────────────────     │
│ Output:                                │
│ Sum = 15                               │
│                                        │
└────────────────────────────────────────┘
```

**Benefits:**
- ✅ Complete documentation
- ✅ Professional format
- ✅ Shows working code + test case
- ✅ Ready for submission

---

## 🚀 Quick Start

### To Use:
1. Open code editor
2. Write your code
3. (Optional) Add input
4. (Optional) Run program
5. Click the **💾 Save button**
6. PDF downloads! 📥

### Success Indicators:
- ✓ Button shows checkmark
- ✓ PDF file appears in downloads
- ✓ Filename includes program name and date
- ✓ PDF opens with all content

---

## ✅ What Gets Included

| Element | Always Included | Optional |
|---------|----------------|----------|
| Program Title | ✅ Yes | - |
| Language Badge | ✅ Yes | - |
| Program Code | ✅ Yes | - |
| Input | ❌ No | ✅ If provided |
| Output | ❌ No | ✅ If executed |

---

**Result:** Click Save → Get Professional PDF! 🎉
