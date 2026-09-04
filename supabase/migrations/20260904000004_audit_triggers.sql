-- ====================================================================
-- Sabores 4.0: Automated Audit Triggers Migration
-- Migration ID: 20260904000004_audit_triggers
-- Description: Automatically logs create, update, delete, publish, and unpublish actions on core tables
-- ====================================================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Triggers to Content Tables
DROP TRIGGER IF EXISTS audit_recipes_trigger ON public.recipes;
CREATE TRIGGER audit_recipes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.recipes
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_festivals_trigger ON public.festivals;
CREATE TRIGGER audit_festivals_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.festivals
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_multimedia_trigger ON public.multimedia;
CREATE TRIGGER audit_multimedia_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.multimedia
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_curiosities_trigger ON public.curiosities;
CREATE TRIGGER audit_curiosities_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.curiosities
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_trivia_trigger ON public.trivia_questions;
CREATE TRIGGER audit_trivia_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.trivia_questions
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
