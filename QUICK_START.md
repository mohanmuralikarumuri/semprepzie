# Quick Start - Lab Code Execution

## 🚀 Start Using in 3 Steps

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Step 3: Test It!
1. Open browser to frontend URL
2. Navigate to **Lab** section
3. Select **Python** (or C/C++)
4. Choose any program
5. Click **"Run Code"** button
6. See output appear!

---

## ✅ What Works Right Now

### Free API Providers (Active)
- ✅ **Piston** (~50 runs/day)
- ✅ **Wandbox** (~50 runs/day, C/C++ only)
- ✅ **OneCompiler** (~100 runs/day)
- ✅ **Rextester** (~50 runs/day)
- ✅ **JDoodle** (200 runs/day) - **Already configured!**

**Total:** ~450-650 free executions per day

### Optional Providers (Add API keys for more)
- ⚪ **Glot.io** (+100/day) - Easy signup
- ⚪ **Judge0/RapidAPI** (+50/day) - Easy signup
- ⚪ **Paiza.io** (+10/day)
- ⚪ **Codex** (variable)

---

## 📝 Example Programs to Test

### Python - Hello World
```python
print("Hello from Lab!")
```

### Python - With Input
```python
name = input()
print(f"Hello, {name}!")
```
Add "Alice" in the **Input** panel before running.

### C - Simple Program
```c
#include <stdio.h>
int main() {
    printf("Hello from C!\n");
    return 0;
}
```

### C++ - With Input
```cpp
#include <iostream>
using namespace std;

int main() {
    string name;
    cin >> name;
    cout << "Hello, " << name << "!" << endl;
    return 0;
}
```
Add "Bob" in the **Input** panel before running.

---

## 🔑 Want More Executions? (Optional)

### Add Glot.io (5 minutes, +100/day)
1. Go to https://glot.io/
2. Sign up (free)
3. Get API token from settings
4. Add to `backend/.env`:
   ```
   GLOT_TOKEN=your_token_here
   ```
5. Restart backend

### Add Judge0/RapidAPI (5 minutes, +50/day)
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up (free)
3. Subscribe to free tier
4. Copy API key
5. Add to `backend/.env`:
   ```
   RAPIDAPI_KEY=your_key_here
   ```
6. Restart backend

**Result:** ~700-800 executions/day with both added!

---

## 🏢 Want Unlimited? (Future)

Follow the Oracle Cloud migration guide in `EXECUTION_API_GUIDE.md` to:
- Setup your own Judge0 instance on Oracle Cloud (free tier)
- Get **unlimited executions** on your infrastructure
- Full control over execution environment

---

## 🐛 Common Issues

### "Connection refused"
- ✅ Make sure backend is running on port 3000
- ✅ Check `backend/.env` has correct PORT setting

### "Execution failed"
- ✅ Check backend console for error logs
- ✅ System automatically tries multiple providers
- ✅ At least 5 providers work without any setup!

### "No output appears"
- ✅ Wait a few seconds (providers take 2-5 seconds)
- ✅ Check browser console for errors
- ✅ Verify backend is running

### Code needs input but none provided
- ✅ Use the **Input** panel on the left
- ✅ Enter your input data there
- ✅ Then click "Run Code"

---

## 📚 Complete Documentation

- **Full Setup Guide:** `EXECUTION_API_GUIDE.md`
  - All 10 providers explained
  - Step-by-step API key acquisition
  - Oracle Cloud migration guide
  - Troubleshooting section

- **Implementation Details:** `LAB_EXECUTION_COMPLETE.md`
  - Technical architecture
  - Security model
  - File structure
  - Success indicators

---

## 🎯 Architecture at a Glance

```
┌──────────────┐
│   Frontend   │
│  (Lab UI)    │ 
└──────┬───────┘
       │ 
       │ POST /api/execute
       │ { language, code, stdin }
       ▼
┌──────────────────────────────────────┐
│         Backend                      │
│  ┌────────────────────────────────┐  │
│  │  Execute Service               │  │
│  │  - Try Oracle (future)         │  │
│  │  - Try Piston ✅               │  │
│  │  - Try Wandbox ✅              │  │
│  │  - Try OneCompiler ✅          │  │
│  │  - Try Glot ⚪                 │  │
│  │  - Try Judge0 ⚪               │  │
│  │  - Try Rextester ✅            │  │
│  │  - Try Codex ⚪                │  │
│  │  - Try Paiza ⚪                │  │
│  │  - Try JDoodle ✅              │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
           │
           │ API calls (with API keys)
           ▼
    ┌──────────────────┐
    │  Compiler APIs   │
    │  (External)      │
    └──────────────────┘
```

**✅ Active** = Works now without setup
**⚪ Optional** = Add API key to enable

---

## ✨ Features

- ✅ **Real code execution** (no simulation)
- ✅ **10 compiler APIs** with automatic rotation
- ✅ **Proper input handling** (stdin support)
- ✅ **Secure** (API keys only in backend)
- ✅ **Dark mode** support
- ✅ **Copy code** functionality
- ✅ **Error handling** with fallback
- ✅ **Future-proof** (Oracle Cloud ready)

---

## 🎉 Ready to Use!

The system is fully functional right now with 5 active providers. Just start the servers and begin running code!

**No additional setup required** unless you want more daily executions.
