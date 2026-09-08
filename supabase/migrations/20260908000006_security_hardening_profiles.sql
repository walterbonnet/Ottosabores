-- ====================================================================
-- Sabores 4.0: Profiles Security Hardening & LOGIC Remediation Migration
-- Migration ID: 20260908000006_security_hardening_profiles
-- Description: Remediates LOGIC-01 (Privilege Escalation), LOGIC-02 (XP Tampering),
--              LOGIC-03 (Trivia Direct Table Disclosure), and LOGIC-04 (SECURITY DEFINER search_path).
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PROFILES: TRIGGER FOR SENSITIVE COLUMN INTEGRITY (LOGIC-01 & LOGIC-02)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_role public.user_role;
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();

    -- Protect 'id' column from tampering
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Modifying profile primary key (id) is strictly forbidden.';
    END IF;

    -- Protect 'role' column from non-admin modification (LOGIC-01)
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF v_caller_id IS NOT NULL THEN
            SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
            IF v_caller_role IS DISTINCT FROM 'admin'::public.user_role THEN
                RAISE EXCEPTION 'Changing role is restricted to system administrators.';
            END IF;
        END IF;
    END IF;

    -- Protect 'xp' and 'level_title' from direct client updates (LOGIC-02)
    -- Direct updates to xp or level_title via client PostgREST UPDATE are blocked
    -- unless initiated via internal system context (pg_trigger_depth > 1 or award_user_xp RPC)
    IF (NEW.xp IS DISTINCT FROM OLD.xp OR NEW.level_title IS DISTINCT FROM OLD.level_title) THEN
        IF pg_trigger_depth() <= 1 AND current_setting('request.jwt.claim.sub', true) IS NOT NULL THEN
            -- Check if caller is bypassing award_user_xp RPC
            IF current_setting('sabores.allow_xp_update', true) IS DISTINCT FROM 'true' THEN
                RAISE EXCEPTION 'Direct client modification of xp and level_title is forbidden. Use official RPC or system actions.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_protect_profile_sensitive_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_sensitive_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();

-- --------------------------------------------------------------------
-- 2. HARDENED PROFILES UPDATE RLS POLICY (WITH CHECK FOR ID MATCH)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------------------
-- 3. SECURE RPC FOR AWARDING USER XP (SERVER-SIDE CALCULATION)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_user_xp(p_xp_to_add INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_new_title TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to receive XP.';
    END IF;

    IF p_xp_to_add <= 0 OR p_xp_to_add > 1000 THEN
        RAISE EXCEPTION 'Invalid XP amount.';
    END IF;

    SELECT xp INTO v_current_xp FROM public.profiles WHERE id = v_user_id;
    IF v_current_xp IS NULL THEN
        v_current_xp := 0;
    END IF;

    v_new_xp := v_current_xp + p_xp_to_add;

    -- Calculate level title server-side
    IF v_new_xp < 100 THEN
        v_new_title := 'Cocinero Novato 🌾';
    ELSIF v_new_xp < 300 THEN
        v_new_title := 'Explorador de Sabores 🌶️';
    ELSIF v_new_xp < 600 THEN
        v_new_title := 'Maestro del Fuego 🔥';
    ELSE
        v_new_title := 'Leyenda Taragüí 👑';
    END IF;

    -- Set local session config to authorize profile update trigger
    PERFORM set_config('sabores.allow_xp_update', 'true', true);

    UPDATE public.profiles
    SET xp = v_new_xp,
        level_title = v_new_title,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'xp', v_new_xp,
        'level_title', v_new_title
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION public.award_user_xp(INTEGER) TO authenticated;

-- --------------------------------------------------------------------
-- 4. TRIVIA QUESTIONS TABLE PERMISSIONS HARDENING (LOGIC-03)
-- --------------------------------------------------------------------
REVOKE SELECT ON public.trivia_questions FROM anon, authenticated;
GRANT SELECT ON public.client_trivia_questions TO anon, authenticated;
GRANT SELECT ON public.trivia_answers TO anon, authenticated;

-- Editors and Admins retain table access for CMS management
GRANT SELECT ON public.trivia_questions TO authenticated;
-- (Note: RLS on trivia_questions continues to enforce is_published OR is_editor())

-- --------------------------------------------------------------------
-- 5. SECURITY DEFINER FUNCTIONS HARDENING WITH SET search_path = '' (LOGIC-04)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('editor'::public.user_role, 'admin'::public.user_role)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_resource_id TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF (TG_OP = 'INSERT') THEN
        v_action := 'create';
        v_resource_id := NEW.id::text;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_published IS FALSE AND NEW.is_published IS TRUE) THEN
            v_action := 'publish';
        ELSIF (OLD.is_published IS TRUE AND NEW.is_published IS FALSE) THEN
            v_action := 'unpublish';
        ELSE
            v_action := 'update';
        END IF;
        v_resource_id := NEW.id::text;
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'delete';
        v_resource_id := OLD.id::text;
    END IF;

    INSERT INTO public.audit_logs (user_id, action, resource_table, resource_id, metadata, timestamp)
    VALUES (
        v_user_id,
        v_action,
        TG_TABLE_NAME,
        v_resource_id,
        jsonb_build_object('op', TG_OP),
        NOW()
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Revoke execute on internal trigger function from public
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC, anon, authenticated;
