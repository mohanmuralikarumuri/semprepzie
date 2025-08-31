# 🔧 Fix Supabase Database Schema

## The Problem
The migration failed because the database was expecting UUID types but your data uses string IDs like "ooad", "ai-unit1", etc.

## Quick Fix

### Step 1: Run the Fix Script
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `supabase-fix-schema.sql`
4. Click **Run** to execute the script

### Step 2: Verify Tables
After running the script, you should see:
- ✅ `subjects` table with TEXT id column
- ✅ `units` table with TEXT id column  
- ✅ `documents` table with TEXT id column
- ✅ All foreign key relationships working
- ✅ Public read access enabled

### Step 3: Test Migration
1. Go to: `http://localhost:5174/migration`
2. Click **"Start Migration"**
3. Should now work without UUID errors!

## What the Fix Does
- **Drops** existing tables (if any)
- **Recreates** tables with TEXT IDs instead of UUIDs
- **Matches** your data structure exactly:
  - subjects: "ooad", "ai", "cn", etc.
  - units: "ooad-unit1", "ai-unit1", etc.
  - documents: "ooad-unit1-doc1", etc.
- **Enables** public read access
- **Adds** proper indexes for performance

## Verification Query
Run this in Supabase SQL Editor to verify:
```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('subjects', 'units', 'documents') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

You should see `id` columns as `text` type, not `uuid`.

## After Fix
1. ✅ Migration will work
2. ✅ Latest Updates will show
3. ✅ Dynamic data loading will work
4. ✅ Ready for production!
