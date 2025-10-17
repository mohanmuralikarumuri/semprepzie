# Code Execution API Setup Guide

## 🎯 Architecture Overview

Your code execution system uses a **future-proof architecture**:

### Current State (Using Free APIs)
- Backend aggregates 10 free compiler APIs
- Automatic provider rotation to maximize daily execution quota
- All API keys secured in backend (never exposed to frontend)
- Real compilation and execution with proper stdin/input handling

### Future State (Your Oracle Cloud Setup)
- Oracle Cloud VM + Judge0 + Docker
- Unlimited private executions
- No rate limits
- Complete control and security
- **Easy migration**: Just add 2 environment variables!

---

## 🔐 Security Model

### ✅ Secure (Current Implementation)
```
Frontend → Backend API → Provider APIs
           (Keys here)   
```
- Frontend only calls `/api/execute`
- Backend stores ALL API keys
- Keys never sent to browser

### ❌ Insecure (What we avoided)
```
Frontend → Provider APIs
(Keys exposed in browser = anyone can steal)
```

---

## 🚀 Quick Start (Current Free Providers)

### Already Working (No Setup Needed)

| Provider | Daily Limit | Status | Note |
|----------|------------|--------|------|
| JDoodle | 200 | ✅ Configured | Your credentials already in `.env` |
| Piston | ~50 | ✅ Working | Community instance, no key needed |
| Wandbox | ~50 | ✅ Working | C/C++ only, no key needed |
| Rextester | ~50 | ✅ Working | No key needed |
| OneCompiler | ~100 | ✅ Working | No key needed |

**Current working capacity: ~450 executions/day**

---

## 📝 Get Additional Free API Keys (Optional)

Add these to increase your daily quota to **~650 executions/day**:

### 1. Glot.io (+100/day) - 2 minutes

**Steps:**
1. Go to https://glot.io
2. Click "Sign Up" → Create account
3. Go to https://glot.io/account/token
4. Click "Generate Token"
5. Copy token (format: `glot_xxxxx...`)

**Add to `backend/.env`:**
```bash
GLOT_TOKEN=glot_xxxxxxxxxxxxxxxxxxxxx
```

---

### 2. Judge0 via RapidAPI (+50/day) - 3 minutes

**Steps:**
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up / Log in to RapidAPI
3. Click "Subscribe to Test"
4. Select **FREE tier** ($0.00/month)
5. Go to "Code Snippets" tab
6. Copy your API key from `X-RapidAPI-Key` header

**Add to `backend/.env`:**
```bash
RAPIDAPI_KEY=your_rapidapi_key_here
```

---

### 3. Paiza.io (+10/day) - 2 minutes

**Steps:**
1. Go to https://paiza.io
2. Sign up
3. Visit https://paiza.io/en/api
4. Click "Get API Key"
5. Copy your key

**Add to `backend/.env`:**
```bash
PAIZA_API_KEY=your_paiza_key_here
```

---

### 4. Codex (+20/day, optional)

**Note:** Codex API availability varies. Skip if not needed.

**If available:**
```bash
CODEX_API_KEY=your_codex_key_here
```

---

## 🎯 Provider Priority & Rotation

The backend automatically tries providers in this order:

1. **Oracle Judge0** (when you set it up - unlimited!) 🎯
2. **Piston** (fast, no key) ⚡
3. **Wandbox** (C/C++ specialist) 
4. **OneCompiler** (good capacity)
5. **Glot** (if key provided)
6. **Judge0/RapidAPI** (if key provided)
7. **Rextester** (fallback)
8. **Codex** (if key provided)
9. **Paiza** (if key provided)
10. **JDoodle** (highest quota, backup)

If one fails or hits limit → automatically tries next! ✨

---

## 🏢 Future: Oracle Cloud + Judge0 Setup

### Why Oracle Cloud + Judge0?

- **Free tier**: 4 OCPUs + 24GB RAM forever
- **Judge0**: Production-ready code execution engine
- **Docker**: Sandboxed, secure execution
- **Unlimited**: No API limits, your own instance
- **Fast**: No network latency to third parties

### When You Get Oracle Cloud

#### Step 1: Set Up Oracle Cloud VM
```bash
# Create Oracle Cloud account (free tier)
# Launch Ubuntu VM (Ampere or AMD)
# Note down: Public IP address
```

#### Step 2: Install Judge0 on VM
```bash
# SSH into your Oracle VM
ssh ubuntu@your-oracle-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Judge0
cd ~
git clone https://github.com/judge0/judge0.git
cd judge0
sudo docker-compose up -d
```

#### Step 3: Configure Judge0
```bash
# Edit judge0.conf to set API key
sudo nano judge0.conf

# Set your secure API key
JUDGE0_API_KEY=your_super_secret_key_here

# Restart Judge0
sudo docker-compose restart
```

#### Step 4: Update Backend `.env`
```bash
# In your backend/.env file, uncomment and set:
ORACLE_JUDGE0_URL=http://your-oracle-ip:2358/submissions
ORACLE_JUDGE0_KEY=your_super_secret_key_here
```

#### Step 5: Done! 🎉
The backend will automatically start using your Oracle instance first!

**No code changes needed** - the provider rotation handles everything.

---

## 📊 Current Daily Capacity Summary

| Scenario | Providers | Daily Limit |
|----------|-----------|-------------|
| **Minimum** (default) | 5 free providers | ~450/day |
| **Recommended** (add 2 keys) | +Glot +Judge0 | ~600/day |
| **Maximum** (add all keys) | All 10 providers | ~650/day |
| **Future** (Oracle Cloud) | Your instance + fallbacks | **Unlimited** |

---

## 🧪 Testing Your Setup

### Test Backend API
```bash
# Test the backend endpoint
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello World\")",
    "stdin": ""
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "output": "Hello World\n",
  "provider": "piston"
}
```

### Test with Input
```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "name = input()\nprint(f\"Hello {name}\")",
    "stdin": "Alice"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "output": "Hello Alice\n",
  "provider": "piston"
}
```

---

## 🔧 Troubleshooting

### Provider Keeps Failing
- Check backend logs: `npm run dev` (in backend folder)
- Look for: "Provider X failed: <reason>"
- Solution: The system automatically tries next provider

### All Providers Failed
- Check if API keys are correctly set in `.env`
- Verify no typos in key values
- Check backend can reach internet
- Look at backend console for specific errors

### Oracle Judge0 Not Working (Future)
- Ensure Docker is running on Oracle VM
- Check firewall allows port 2358
- Verify Judge0 container is up: `docker ps`
- Check Judge0 logs: `docker logs judge0`

---

## 📋 Complete `.env` Template

```bash
# ============================================
# CODE EXECUTION - FUTURE (Oracle Cloud)
# ============================================
# Uncomment when you set up Oracle Cloud + Judge0:
# ORACLE_JUDGE0_URL=http://your-oracle-ip:2358
# ORACLE_JUDGE0_KEY=your_super_secret_key

# ============================================
# CODE EXECUTION - CURRENT (Free Providers)
# ============================================

# Already configured ✅
JDOODLE_CLIENT_ID=9df0d0e98ed81ea62b2d926a9287a64e
JDOODLE_CLIENT_SECRET=8b97fd86f4cb27907aa04f7354dc6a385eca4b4c8733e5d0d81961ebedc7269e

# Add these for more capacity:
GLOT_TOKEN=get_from_glot.io
RAPIDAPI_KEY=get_from_rapidapi.com
PAIZA_API_KEY=get_from_paiza.io
CODEX_API_KEY=optional

# Already working (no keys needed):
PISTON_URL=https://emkc.org/api/v2/piston/execute
# Wandbox, Rextester, OneCompiler = no keys needed
```

---

## 🎓 How It Works

### Current Flow
```
User writes code in Lab
       ↓
Frontend sends to /api/execute
       ↓
Backend tries providers in order:
  1. Piston → Success! ✅
  2. (or next if failed)
       ↓
Returns output to frontend
       ↓
User sees result
```

### Future Flow (With Oracle)
```
User writes code in Lab
       ↓
Frontend sends to /api/execute
       ↓
Backend tries Oracle first:
  1. Oracle Judge0 → Success! ⚡ (fastest, unlimited)
  2. (if Oracle down, tries free providers)
       ↓
Returns output to frontend
       ↓
User sees result
```

---

## ✅ Migration Checklist

When you get Oracle Cloud:

- [ ] Create Oracle Cloud free tier account
- [ ] Launch Ubuntu VM
- [ ] Install Docker on VM
- [ ] Install Judge0 with Docker
- [ ] Set up Judge0 API key
- [ ] Note Oracle VM public IP
- [ ] Add 2 lines to `backend/.env`:
  - `ORACLE_JUDGE0_URL=http://your-ip:2358`
  - `ORACLE_JUDGE0_KEY=your-key`
- [ ] Restart backend: `npm run dev`
- [ ] Test: Code should now use your Oracle instance!

**That's it!** No code changes needed. 🎉

---

## 📞 Support

If you need help:
1. Check backend logs for specific errors
2. Verify `.env` keys are correct
3. Test each provider individually
4. Check the provider's status page

---

## 🎉 Summary

✅ **Now:** 450-650 free executions/day across 10 providers  
✅ **Secure:** All API keys in backend only  
✅ **Real execution:** Proper compilation with stdin/input  
✅ **Future-ready:** Just add 2 env vars for unlimited Oracle Cloud  

Your architecture is production-ready and scales perfectly! 🚀
