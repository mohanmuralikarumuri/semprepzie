# ��� URGENT: Supabase Configuration Required

## Issue
The lab subjects are not loading because the Supabase API key in your `.env` file is invalid.

## Solution - Get Your Actual Supabase Credentials

### Step 1: Go to Supabase Dashboard
Open this link in your browser:
```
https://supabase.com/dashboard/project/lnbjkowlhordgyhzhpgi/settings/api
```

### Step 2: Copy Your Credentials
You'll see a page with two important values:

1. **Project URL** (should be):
   ```
   https://lnbjkowlhordgyhzhpgi.supabase.co
   ```

2. **anon public key** - This is a long JWT token that looks like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```
   Copy the **ENTIRE** key (it's very long, around 200+ characters)

### Step 3: Update Your `.env` File

Open `backend/.env` and update these lines:

```env
SUPABASE_URL=https://lnbjkowlhordgyhzhpgi.supabase.co
SUPABASE_ANON_KEY=<paste_your_actual_anon_key_here>
```

**IMPORTANT**: 
- Don't add quotes around the key
- Make sure you copy the FULL key (it's very long)
- It should start with `eyJ` and be around 200-250 characters long

### Step 4: Restart the Backend Server

After updating the `.env` file:

1. Stop the backend server (if running)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

### Step 5: Test It

You can test if it's working by running:
```bash
cd backend
node test-supabase.js
```

If successful, you should see:
```
SUCCESS! Found X subjects
Data: [...]
```

## Why This Happened

The API key I added to your `.env` file was just a sample/placeholder. Each Supabase project has its own unique API key that you must get from your Supabase dashboard.

## Need Help?

If you can't access the Supabase dashboard or don't see the API settings:
1. Make sure you're logged into Supabase
2. Make sure the project `lnbjkowlhordgyhzhpgi` belongs to your account
3. If you created the project with a different email, log in with that email

---

**Once you update the `.env` file with the correct key, the lab subjects will load immediately!**
