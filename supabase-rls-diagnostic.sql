-- =====================================================
-- QUICK DIAGNOSTIC: Test if RLS is blocking operations
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose the issue
-- =====================================================

-- Step 1: Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN c.relrowsecurity THEN '🔒 RLS ENABLED' 
        ELSE '🔓 RLS DISABLED' 
    END as rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public'
AND tablename IN (
    'subjects', 'units', 'documents',
    'lab_subjects', 'lab_programs',
    'mincode_subjects', 'mincode_programs'
)
ORDER BY tablename;

-- Step 2: Check what policies exist
SELECT 
    tablename,
    policyname,
    CASE cmd
        WHEN 'SELECT' THEN '👀 READ'
        WHEN 'INSERT' THEN '➕ CREATE'
        WHEN 'UPDATE' THEN '✏️ EDIT'
        WHEN 'DELETE' THEN '🗑️ DELETE'
    END as operation,
    CASE 
        WHEN roles = '{public}' THEN '🌐 Public'
        WHEN roles = '{authenticated}' THEN '🔐 Authenticated'
        WHEN roles = '{anon}' THEN '👤 Anonymous'
        ELSE '❓ ' || array_to_string(roles, ', ')
    END as who_can_access
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'subjects', 'units', 'documents',
    'lab_subjects', 'lab_programs',
    'mincode_subjects', 'mincode_programs'
)
ORDER BY tablename, cmd;

-- Step 3: Test INSERT permission (as anonymous user)
-- This simulates what your frontend does
SET ROLE anon;

-- Try to insert a test record
DO $$
BEGIN
    INSERT INTO lab_subjects (id, name, code, description, icon)
    VALUES ('rls-test-subject', 'RLS Test Subject', 'rls-test', 'Testing RLS policies', '🧪');
    
    RAISE NOTICE '✅ INSERT SUCCESSFUL! RLS policies are correctly configured.';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE '❌ INSERT FAILED: No policy allows this operation';
    WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT FAILED: %', SQLERRM;
END $$;

-- Reset role
RESET ROLE;

-- Clean up test data
DELETE FROM lab_subjects WHERE id = 'rls-test-subject';

-- Step 4: Check for any policy conflicts
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT cmd::text, ', ') as operations_covered
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('lab_subjects', 'lab_programs', 'mincode_subjects', 'mincode_programs')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- INTERPRETATION:
-- =====================================================
-- 
-- If you see:
-- ✅ "INSERT SUCCESSFUL" → RLS is configured correctly
-- ❌ "No policy allows" → You need to run the RLS setup script
--
-- Expected result for each table:
-- - 4 policies: SELECT, INSERT, UPDATE, DELETE
-- - All should allow 'public' or 'anon' role
--
-- If policy_count < 4, you're missing policies!
-- =====================================================
