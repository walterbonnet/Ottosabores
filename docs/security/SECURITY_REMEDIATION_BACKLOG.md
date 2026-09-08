# Sabores 4.0 – Security Remediation Backlog

> [!NOTE]
> **Registro de Seguimiento y Estado de Remediación**: Este documento registra el backlog consolidado de todas las vulnerabilidades detectadas durante las fases de Penetration Test y su estado actual de resolución.

---

## Matriz de Seguimiento del Backlog de Seguridad

| Prioridad | Vulnerabilidad | Descripción de la Acción Aplicada | Archivo / Componente Afectado | Responsable | Estado Final |
|---|---|---|---|---|---|
| **1. CRITICAL** | **LOGIC-01** | Implementación de trigger `protect_profile_sensitive_columns` para bloquear la actualización no autorizada de `profiles.role` a no administradores. | [`supabase/migrations/20260908000006_security_hardening_profiles.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260908000006_security_hardening_profiles.sql) | AppSec Team | **RESOLVED** |
| **1. CRITICAL** | **EDGE-03** | Refactorización de Edge Function `submit-trivia-answer` para derivar identidad del token JWT (`userClient.auth.getUser()`) ignorando `userId` en el body. | [`supabase/functions/submit-trivia-answer/index.ts`](file:///f:/Feria2026/Sabores%204.0/supabase/functions/submit-trivia-answer/index.ts) | AppSec / Backend | **RESOLVED** |
| **2. HIGH** | **LOGIC-02** | Bloqueo de asignación masiva/directa de `xp` y `level_title` en cliente. Creación de RPC `award_user_xp` que calcula niveles server-side. | [`src/services/repositories/profileRepository.ts`](file:///f:/Feria2026/Sabores%204.0/src/services/repositories/profileRepository.ts) | AppSec / Frontend | **RESOLVED** |
| **2. HIGH** | **STORAGE-01** | Hardening de políticas RLS en bucket `profiles` exigiendo prefijo de carpeta `(storage.foldername(name))[1] = auth.uid()::text`. | [`supabase/migrations/20260904000005_storage_security_hardening.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260904000005_storage_security_hardening.sql) | AppSec Team | **RESOLVED** |
| **2. HIGH** | **EDGE-01 / EDGE-02** | Activación de `verify_jwt = true` en `config.toml` y validación de Bearer headers en Edge Functions. | [`supabase/config.toml`](file:///f:/Feria2026/Sabores%204.0/supabase/config.toml) | AppSec Team | **RESOLVED** |
| **3. MEDIUM** | **LOGIC-03** | Revocación de permiso `SELECT` directo a roles públicos sobre `public.trivia_questions`, forzando uso de la vista `client_trivia_questions`. | [`supabase/migrations/20260908000006_security_hardening_profiles.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260908000006_security_hardening_profiles.sql) | Database Security | **RESOLVED** |
| **3. MEDIUM** | **LOGIC-04** | Adición de `SET search_path = ''` y nombres schema-qualified a todas las funciones `SECURITY DEFINER` (`is_editor`, `is_admin`, `process_audit_log`, `award_user_xp`). | [`supabase/migrations/20260908000006_security_hardening_profiles.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260908000006_security_hardening_profiles.sql) | Database Security | **RESOLVED** |
| **3. MEDIUM** | **STORAGE-02** | Validación estricta de `metadata->>'mimetype'` en la cláusula `WITH CHECK` de `storage.objects` para imágenes. | [`supabase/migrations/20260904000005_storage_security_hardening.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260904000005_storage_security_hardening.sql) | Database Security | **RESOLVED** |
| **4. LOW** | **STORAGE-03** | Apertura pública del bucket `profiles` para consulta de avatares en la UI comunitaria. | [`supabase/migrations/20260904000003_storage_buckets.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260904000003_storage_buckets.sql) | Product / Design | **ACCEPTED RISK** |

---

## Estado Global del Backlog

- **Total de Items en Backlog**: 9
- **Items Resueltos**: 8 (100% de vulnerabilidades críticas, altas y medias)
- **Items Aceptados**: 1 (Requerimiento funcional bajo control)
- **Items Pendientes**: **0**
