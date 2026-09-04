-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 10: Audit Logs Integrity & Access Control Audit
-- ====================================================================

BEGIN;

INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('44444444-4444-4444-4444-444444444444', 'admin@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user'),
  ('44444444-4444-4444-4444-444444444444', 'admin@sabores.local', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Populate test audit log entry
INSERT INTO public.audit_logs (user_id, action, resource_table, resource_id) 
VALUES ('44444444-4444-4444-4444-444444444444', 'publish', 'recipes', 'r1');

-- Context 1: Authenticated Normal User A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 1. SELECT audit logs as Normal User (Should return 0 rows)
SELECT * FROM public.audit_logs;

-- 2. INSERT into audit logs directly as Normal User (Should be blocked or ignored by RLS)
INSERT INTO public.audit_logs (user_id, action, resource_table) 
VALUES ('11111111-1111-1111-1111-111111111111', 'fake_log', 'recipes');

-- Context 2: Authenticated Admin
SET LOCAL request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

-- 3. SELECT audit logs as Admin (Should succeed)
SELECT * FROM public.audit_logs;

ROLLBACK;
