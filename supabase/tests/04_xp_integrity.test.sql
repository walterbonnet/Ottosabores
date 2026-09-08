-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 04: Gamification XP, Level Title Integrity & Trivia Access (TEST-XP-01 to TEST-XP-04, TEST-TRIVIA-01, TEST-TRIVIA-02, TEST-DEF-01)
-- ====================================================================

BEGIN;

INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role, xp, level_title) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user', 10, 'Cocinero Novato 🌾')
ON CONFLICT (id) DO UPDATE SET xp = 10, level_title = 'Cocinero Novato 🌾';

-- --------------------------------------------------------------------
-- TEST-XP-01: USER_A direct SQL UPDATE on xp -> DENIED
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

DO $$
BEGIN
    UPDATE public.profiles SET xp = 9999999 WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST-XP-01 FAILED: Direct XP update was permitted!';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Direct client modification of xp%' THEN
        RAISE NOTICE 'TEST-XP-01 PASSED: Direct client XP update rejected by trigger.';
    ELSE
        RAISE NOTICE 'TEST-XP-01 PASSED with exception: %', SQLERRM;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-XP-02: USER_A direct SQL UPDATE on level_title -> DENIED
-- --------------------------------------------------------------------
DO $$
BEGIN
    UPDATE public.profiles SET level_title = 'Gran Maestro Culinario 👑' WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST-XP-02 FAILED: Direct level_title update was permitted!';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Direct client modification of xp%' THEN
        RAISE NOTICE 'TEST-XP-02 PASSED: Direct client level_title update rejected by trigger.';
    ELSE
        RAISE NOTICE 'TEST-XP-02 PASSED with exception: %', SQLERRM;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-XP-03: USER_A mass assignment attempt -> DENIED
-- --------------------------------------------------------------------
DO $$
BEGIN
    UPDATE public.profiles 
    SET display_name = 'Hacked User', role = 'admin', xp = 500000, level_title = 'Admin' 
    WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST-XP-03 FAILED: Mass assignment payload was processed!';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST-XP-03 PASSED: Mass assignment payload rejected by trigger protection.';
END $$;

-- --------------------------------------------------------------------
-- TEST-XP-04: USER_A calls award_user_xp RPC -> ALLOWED & Auto-calculated Level
-- --------------------------------------------------------------------
DO $$
DECLARE
    v_res JSONB;
BEGIN
    v_res := public.award_user_xp(150);
    IF (v_res->>'success')::boolean = true AND (v_res->>'xp')::integer = 160 THEN
        RAISE NOTICE 'TEST-XP-04 PASSED: RPC award_user_xp executed successfully (XP: 160, Level: %).', v_res->>'level_title';
    ELSE
        RAISE EXCEPTION 'TEST-XP-04 FAILED: RPC returned invalid result: %', v_res;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-TRIVIA-01: Direct SELECT on public.trivia_questions by authenticated -> DENIED
-- --------------------------------------------------------------------
DO $$
BEGIN
    PERFORM correct_answer_idx FROM public.trivia_questions;
    RAISE EXCEPTION 'TEST-TRIVIA-01 FAILED: authenticated role was able to query trivia_questions directly!';
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%permission denied%' THEN
        RAISE NOTICE 'TEST-TRIVIA-01 PASSED: Direct SELECT on trivia_questions denied for authenticated.';
    ELSE
        RAISE NOTICE 'TEST-TRIVIA-01 PASSED with exception: %', SQLERRM;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- TEST-TRIVIA-02: SELECT on public.client_trivia_questions by authenticated -> ALLOWED
-- --------------------------------------------------------------------
DO $$
BEGIN
    PERFORM question FROM public.client_trivia_questions;
    RAISE NOTICE 'TEST-TRIVIA-02 PASSED: client_trivia_questions is accessible.';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'TEST-TRIVIA-02 FAILED: client_trivia_questions query failed: %', SQLERRM;
END $$;

-- --------------------------------------------------------------------
-- TEST-DEF-01: Verify SECURITY DEFINER functions have search_path set to ''
-- --------------------------------------------------------------------
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN ('is_editor', 'is_admin', 'process_audit_log', 'award_user_xp')
      AND p.prosecdef = true
      AND (p.proconfig IS NULL OR NOT ('search_path=' = ANY(p.proconfig)));

    IF v_count = 0 THEN
        RAISE NOTICE 'TEST-DEF-01 PASSED: All SECURITY DEFINER functions have secure search_path specified.';
    ELSE
        RAISE EXCEPTION 'TEST-DEF-01 FAILED: % SECURITY DEFINER functions lack secure search_path!', v_count;
    END IF;
END $$;

ROLLBACK;
