-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 00: Security Inventory & Schema Inspection
-- Description: Inspects schema, RLS flags, grants, functions, and views
-- ====================================================================

BEGIN;

-- 1. Verify RLS is enabled on all 25 tables in public schema
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Inspect active policies on public schema
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check public views and column exposures
SELECT 
    table_schema, 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('trivia_questions', 'client_trivia_questions')
ORDER BY table_name, column_name;

-- 4. Check table grants for anon and authenticated roles
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

ROLLBACK;
