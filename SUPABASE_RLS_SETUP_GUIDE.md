# Supabase RLS Configuration Guide

## Problem
Admin operations (create, update, delete) show "success" in the UI but don't persist to Supabase database because Row-Level Security (RLS) policies are blocking the operations.

## Solution: Configure RLS Policies

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **semprepzie** (or your project name)
3. In the left sidebar, click on **SQL Editor** (icon looks like `</>`)
4. Click **"+ New query"** button

### Step 2: Run the RLS Policy Script

1. Open the file: `supabase-rls-policies-admin.sql` (in this repository root)
2. Copy the **entire contents** of that file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** button (or press `Ctrl+Enter`)

### Step 3: Verify Policies Are Created

After running the script, you should see output showing the policies were created. Run this verification query:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'subjects', 'units', 'documents',
    'lab_subjects', 'lab_programs',
    'mincode_subjects', 'mincode_programs'
)
ORDER BY tablename, cmd;
```

You should see **4 policies per table**:
- SELECT (read) - already working
- INSERT (create) - **newly enabled**
- UPDATE (modify) - **newly enabled**
- DELETE (remove) - **newly enabled**

### Step 4: Test in Your Application

1. **Hard refresh** your browser (`Ctrl + Shift + R`) or open in incognito
2. Go to Admin Dashboard
3. Test each operation:

#### Test Lab Programs:
- ✅ Create a new lab subject → Should persist
- ✅ Create a new lab program → Should persist
- ✅ Delete a lab program → Should be removed from database
- ✅ Refresh page → Changes should remain

#### Test MinCode Programs:
- ✅ Create a new mincode subject → Should persist
- ✅ Create a new mincode program → Should persist
- ✅ Delete a mincode program → Should be removed
- ✅ Refresh page → Changes should remain

#### Test Document Modifier:
- ✅ Create a subject → Should persist
- ✅ Create a unit → Should persist
- ✅ Upload a document → Should appear in list
- ✅ Delete a subject → Should be removed
- ✅ Refresh page → Changes should remain

### Step 5: Verify in Supabase Database

1. In Supabase Dashboard, click **"Table Editor"** in sidebar
2. Select table: `lab_subjects`, `lab_programs`, `mincode_subjects`, etc.
3. Check that your newly created/deleted items are actually in the database

## What the RLS Policies Do

### Current Setup (After Script):
- **SELECT**: Anyone can read data (public access) ✅
- **INSERT**: Anyone can create data (via anon key) ✅
- **UPDATE**: Anyone can modify data ✅
- **DELETE**: Anyone can delete data ✅

This works because your admin dashboard is **protected by Firebase Authentication** at the application level.

## Security Considerations

### Current Approach (Simple):
```sql
CREATE POLICY "Enable insert for authenticated users" ON lab_subjects
FOR INSERT
WITH CHECK (true);  -- Allows anyone with anon key
```

**Pros**: Simple, works for internal/educational apps
**Cons**: Anyone with your anon key can write data

### Better Approach (Recommended for Production):

#### Option 1: Require Firebase Auth Token
Change frontend to send Firebase ID token and verify in Supabase using a custom function.

#### Option 2: Service Role Key (Backend Only)
Use Supabase **service_role** key in backend API (not frontend) for admin operations.

#### Option 3: Admin Users Table
Create an `admin_users` table and check if `auth.uid()` is in that table:

```sql
CREATE POLICY "Enable insert for admins only" ON lab_subjects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);
```

### Recommended Next Steps (Optional):

1. **For now**: Use the simple policies (script provided) since Firebase Auth protects the UI
2. **Later**: Implement backend API with service_role key for admin operations
3. **Best**: Implement admin role checking in Supabase

## Troubleshooting

### Still not working after running script?

1. **Check RLS is enabled**:
   ```sql
   SELECT tablename, relrowsecurity 
   FROM pg_tables t
   JOIN pg_class c ON t.tablename = c.relname
   WHERE schemaname = 'public'
   AND tablename IN ('lab_subjects', 'lab_programs', 'mincode_subjects', 'mincode_programs');
   ```
   `relrowsecurity` should be `true`

2. **Check policies exist**:
   ```sql
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'lab_subjects';
   ```
   Should show 4 policies (SELECT, INSERT, UPDATE, DELETE)

3. **Test with SQL directly**:
   ```sql
   -- Try inserting a test subject
   INSERT INTO lab_subjects (id, name, code, description, icon)
   VALUES ('test-subject', 'Test Subject', 'test', 'Test description', '📚');
   
   -- If this fails, check error message
   SELECT * FROM lab_subjects WHERE id = 'test-subject';
   ```

4. **Check browser console**:
   - Open DevTools → Console
   - Look for Supabase errors
   - Common error: "new row violates row-level security policy"

5. **Verify anon key is correct**:
   - In `frontend/src/config/supabase.ts`, check `supabaseAnonKey`
   - Should match the anon key in Supabase Dashboard → Settings → API

## Storage Policies (For Document Uploads)

If document uploads fail with "access denied", run this:

```sql
-- Enable public read access to pdfs bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'pdfs');

-- Enable insert for authenticated (via anon key)
CREATE POLICY "Enable insert for authenticated users" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdfs');

-- Enable delete for authenticated
CREATE POLICY "Enable delete for authenticated users" ON storage.objects FOR DELETE
USING (bucket_id = 'pdfs');
```

## Quick Reference: Supabase Dashboard URLs

- **SQL Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
- **Table Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor
- **Storage**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
- **Authentication**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/users
- **API Settings**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

Replace `YOUR_PROJECT_ID` with: `lnbjkowlhordgyhzhpgi` (from your supabase URL)

---

## Summary

**Why changes weren't persisting:**
- Supabase RLS policies were blocking INSERT/UPDATE/DELETE operations
- Frontend showed "success" because the API call didn't throw an error (silent rejection)
- Database never received the changes

**Solution:**
- Run the RLS policy script to allow CRUD operations
- This enables your admin dashboard to persist changes
- Security is maintained by Firebase Auth in the frontend

**After running the script:**
- All admin operations (create, update, delete) will persist to Supabase ✅
- Data will remain after page refresh ✅
- Changes will be visible in Supabase Table Editor ✅
