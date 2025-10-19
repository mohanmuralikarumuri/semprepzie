-- =====================================================
-- SUPABASE RLS POLICIES FOR ADMIN OPERATIONS
-- =====================================================
-- This script sets up Row-Level Security policies to allow
-- admin users to create, update, and delete data.
--
-- Execute this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- =====================================================
-- SUBJECTS TABLE POLICIES
-- =====================================================

-- Enable RLS on subjects table (if not already enabled)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON subjects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subjects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subjects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON subjects;

-- Policy 1: Allow public read access (already working)
CREATE POLICY "Enable read access for all users" ON subjects
FOR SELECT
USING (true);

-- Policy 2: Allow insert for all users (for admin operations via anon key)
CREATE POLICY "Enable insert for authenticated users" ON subjects
FOR INSERT
WITH CHECK (true);

-- Policy 3: Allow update for all users
CREATE POLICY "Enable update for authenticated users" ON subjects
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy 4: Allow delete for all users
CREATE POLICY "Enable delete for authenticated users" ON subjects
FOR DELETE
USING (true);

-- =====================================================
-- UNITS TABLE POLICIES
-- =====================================================

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON units;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON units;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON units;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON units;

CREATE POLICY "Enable read access for all users" ON units
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON units
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON units
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON units
FOR DELETE
USING (true);

-- =====================================================
-- DOCUMENTS TABLE POLICIES
-- =====================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON documents;

CREATE POLICY "Enable read access for all users" ON documents
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON documents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON documents
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON documents
FOR DELETE
USING (true);

-- =====================================================
-- LAB_SUBJECTS TABLE POLICIES
-- =====================================================

ALTER TABLE lab_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON lab_subjects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lab_subjects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON lab_subjects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON lab_subjects;

CREATE POLICY "Enable read access for all users" ON lab_subjects
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON lab_subjects
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON lab_subjects
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON lab_subjects
FOR DELETE
USING (true);

-- =====================================================
-- LAB_PROGRAMS TABLE POLICIES
-- =====================================================

ALTER TABLE lab_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON lab_programs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lab_programs;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON lab_programs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON lab_programs;

CREATE POLICY "Enable read access for all users" ON lab_programs
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON lab_programs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON lab_programs
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON lab_programs
FOR DELETE
USING (true);

-- =====================================================
-- MINCODE_SUBJECTS TABLE POLICIES
-- =====================================================

ALTER TABLE mincode_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON mincode_subjects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON mincode_subjects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON mincode_subjects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON mincode_subjects;

CREATE POLICY "Enable read access for all users" ON mincode_subjects
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mincode_subjects
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON mincode_subjects
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON mincode_subjects
FOR DELETE
USING (true);

-- =====================================================
-- MINCODE_PROGRAMS TABLE POLICIES
-- =====================================================

ALTER TABLE mincode_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON mincode_programs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON mincode_programs;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON mincode_programs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON mincode_programs;

CREATE POLICY "Enable read access for all users" ON mincode_programs
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mincode_programs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON mincode_programs
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON mincode_programs
FOR DELETE
USING (true);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
-- Run this to check all policies are created:

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'subjects', 'units', 'documents',
    'lab_subjects', 'lab_programs',
    'mincode_subjects', 'mincode_programs'
)
ORDER BY tablename, cmd;

-- =====================================================
-- NOTES:
-- =====================================================
-- These policies allow ANY user (including anonymous via anon key)
-- to perform CRUD operations. This is suitable for:
--   1. Admin dashboard protected by Firebase Auth in frontend
--   2. Internal/educational apps where access control is at app level
--
-- SECURITY CONSIDERATION:
-- If you want to restrict writes to authenticated users only,
-- replace `true` with `auth.uid() IS NOT NULL` in INSERT/UPDATE/DELETE policies.
--
-- BETTER APPROACH (RECOMMENDED):
-- Use a custom admin role check:
-- 1. Store admin users in a separate table (e.g., admin_users)
-- 2. Replace `true` with:
--    `EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())`
--
-- For now, this allows all operations for testing.
-- =====================================================
