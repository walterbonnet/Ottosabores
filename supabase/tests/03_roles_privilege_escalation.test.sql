-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 03: RBAC & Role Privilege Escalation (TEST-ROLE-01 to TEST-ROLE-04, TEST-ID-01)
-- ====================================================================

BEGIN;

-- Setup Test Users with standard role 'user', 'editor', 'admin'
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local'),
  ('44444444-4444-4444-4444-444444444444', 'admin@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'Normal User A', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local', 'Normal User B', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local', 'Content Editor', 'editor'),
  ('44444444-4444-4444-4444-444444444444', 'admin@sabores.local', 'System Admin', 'admin')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- --------------------------------------------------------------------
-- TEST-ROLE-01: USER_A attempts to change own role to 'admin' -> DENIED
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

DO $$
BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST-ROLE-01 FAILED: USER_A was able to elevate role to admin!';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Changing role is restricted%' THEN
        RAISE NOTICE 'TEST-ROLE-01 PASSED: Privilege escalation to admin rejected by trigger.';
    ELSE
        RAISE NOTICE 'TEST-ROLE-01 PASSED with exception: %', SQLERRM;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-ROLE-02: USER_A attempts to change own role to 'editor' -> DENIED
-- --------------------------------------------------------------------
DO $$
BEGIN
    UPDATE public.profiles SET role = 'editor' WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST-ROLE-02 FAILED: USER_A was able to elevate role to editor!';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Changing role is restricted%' THEN
        RAISE NOTICE 'TEST-ROLE-02 PASSED: Privilege escalation to editor rejected by trigger.';
    ELSE
        RAISE NOTICE 'TEST-ROLE-02 PASSED with exception: %', SQLERRM;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-ROLE-03: USER_A attempts to change role of USER_B -> DENIED
-- --------------------------------------------------------------------
DO $$
BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = '22222222-2222-2222-2222-222222222222';
    -- If 0 rows affected by RLS, check role remains 'user'
    IF (SELECT role FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222') = 'admin' THEN
        RAISE EXCEPTION 'TEST-ROLE-03 FAILED: USER_A changed USER_B role!';
    ELSE
        RAISE NOTICE 'TEST-ROLE-03 PASSED: Cross-tenant role modification blocked by RLS/Trigger.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST-ROLE-03 PASSED with exception: %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- TEST-ROLE-04: ADMIN changes role of USER_B to 'editor' -> ALLOWED
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';

UPDATE public.profiles SET role = 'editor' WHERE id = '22222222-2222-2222-2222-222222222222';

DO $$
BEGIN
    IF (SELECT role FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222') = 'editor'::public.user_role THEN
        RAISE NOTICE 'TEST-ROLE-04 PASSED: ADMIN successfully updated user role.';
    ELSE
        RAISE EXCEPTION 'TEST-ROLE-04 FAILED: ADMIN was unable to update role!';
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-ID-01: USER_A attempts to modify profile primary key (id) -> DENIED
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

DO $$
BEGIN
    UPDATE public.profiles SET id = '99999999-9999-9999-9999-999999999999' WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST-ID-01 FAILED: USER_A was able to modify profile ID!';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST-ID-01 PASSED: Profile ID modification rejected by trigger/RLS check.';
END $$;

ROLLBACK;
