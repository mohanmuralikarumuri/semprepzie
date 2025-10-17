# Supabase Configuration Setup

## 🚨 Backend is crashing because Supabase credentials are missing!

The error you're seeing:
```
Failed to fetch subjects: Error: Failed to fetch subjects
500 Internal Server Error
```

Is caused by:
```
Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.
```

---

## ✅ How to Fix This

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `lnbjkowlhordgyhzhpgi` (based on your console logs)
3. **Click on "Settings"** (⚙️ icon in the left sidebar)
4. **Click on "API"**
5. **Copy the following:**
   - **Project URL**: `https://lnbjkowlhordgyhzhpgi.supabase.co`
   - **anon/public key**: This is a long string starting with `eyJ...`

### Step 2: Add to Your Backend `.env` File

Open the file: `d:\GitHub\semprepzie\backend\.env`

Add these lines (replace with your actual values):

```env
# Supabase Configuration
SUPABASE_URL=https://lnbjkowlhordgyhzhpgi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYmprb3dsaG9yZGd5aHpocGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTg1Nzc2OTYwMH0.YOUR_ACTUAL_KEY_HERE
```

**⚠️ Important:**
- Replace `YOUR_ACTUAL_KEY_HERE` with the actual key from Supabase dashboard
- The key should be a very long string (200+ characters)
- It's the **anon/public** key, NOT the service_role key

### Step 3: Where to Find the anon/public Key

In Supabase Dashboard → Settings → API:

```
Project URL
https://lnbjkowlhordgyhzhpgi.supabase.co

Project API keys
┌─────────────────────────────────┐
│ anon  public                    │  ← Copy this one!
│ eyJhbGciOiJIUzI1NiIsInR5cCI...│
└─────────────────────────────────┘

service_role  secret                ← Don't use this one
```

### Step 4: Restart the Backend Server

After saving the `.env` file:

1. **Stop the backend** (if running): Press `Ctrl+C` in the terminal
2. **Restart it**: `cd backend && npm run dev`
3. **Check the logs**: Should see `Server running on port 3001` without Supabase errors

---

## 🔍 Verification

After adding the credentials and restarting, test the endpoint:

```bash
curl http://localhost:3001/api/lab/subjects
```

**Should return:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lab-subject-cn",
      "name": "Computer Networks",
      "code": "cn",
      "description": "Network programming, protocols, and socket programming",
      "icon": "🌐"
    },
    ...
  ]
}
```

**If still error:**
- Check that you copied the ENTIRE key (it's very long)
- Make sure there are no extra spaces or quotes
- Verify the URL matches your Supabase project

---

## 📝 Example `.env` File Structure

Your `backend/.env` should look like:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Firebase Admin SDK
FIREBASE_PROJECT_ID=semprepzie-315b1
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@semprepzie-315b1.iam.gserviceaccount.com
# ... other Firebase vars ...

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Supabase Configuration  ← ADD THESE!
SUPABASE_URL=https://lnbjkowlhordgyhzhpgi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_FULL_KEY_HERE

# Email Configuration (optional for now)
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# ... rest of the config ...
```

---

## 🎯 Quick Summary

1. ✅ Created lab subjects tables in Supabase
2. ❌ Forgot to add Supabase credentials to backend `.env`
3. 🔧 **Fix**: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env` file
4. 🔄 Restart backend server
5. ✅ Lab subjects should load!

---

## Need Help?

If you can't find the keys:
1. Log in to https://supabase.com/dashboard
2. Select project: `lnbjkowlhordgyhzhpgi`
3. Settings → API
4. Copy the values and add to `.env`
