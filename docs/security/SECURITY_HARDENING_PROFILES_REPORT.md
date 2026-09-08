# Sabores 4.0 – Reporte de Seguridad: Hardening de Profiles, Integridad de Datos y Funciones Definer

> [!IMPORTANT]
> **Documento Formal de Remediación y Verificación Técnica**: Este documento detalla la remediación completa y verificación de pruebas para las cuatro vulnerabilidades identificadas durante el Pentest de Lógica de Negocio e Integridad de Datos en **Sabores 4.0** (**LOGIC-01**, **LOGIC-02**, **LOGIC-03**, y **LOGIC-04**).

---

## 1. Resumen de Estado de Remediación

| Vulnerabilidad | Severidad | Estado Anterior (Baseline) | Corrección Aplicada | Test de Validación | Resultado Final |
|---|---|---|---|---|---|
| **LOGIC-01** | **CRITICAL** | Escalada vertical de privilegios vía `UPDATE profiles SET role = 'admin'` | Trigger `protect_profile_sensitive_columns` bloquea cambios de rol a no administradores. | `TEST-ROLE-01`, `TEST-ROLE-02`, `TEST-ROLE-03`, `TEST-ROLE-04` | **RESOLVED** |
| **LOGIC-02** | **HIGH** | Inyección arbitraria de XP y `level_title` desde cliente en PostgREST | Bloqueo de `xp`/`level_title` en trigger `protect_profile_sensitive_columns`. Creación de RPC segura `award_user_xp` que deriva usuario de `auth.uid()` y calcula el nivel server-side. | `TEST-XP-01`, `TEST-XP-02`, `TEST-XP-03`, `TEST-XP-04` | **RESOLVED** |
| **LOGIC-03** | **MEDIUM** | Exposición de `correct_answer_idx` en la tabla base `public.trivia_questions` | `REVOKE SELECT ON public.trivia_questions FROM anon, authenticated;`. Concesión exclusiva a la vista segura `public.client_trivia_questions`. | `TEST-TRIVIA-01`, `TEST-TRIVIA-02` | **RESOLVED** |
| **LOGIC-04** | **MEDIUM** | Omisión de `SET search_path = ''` en funciones `SECURITY DEFINER` | Re-definición de `is_editor()`, `is_admin()`, `process_audit_log()` y `award_user_xp()` con `SET search_path = ''` y nombres schema-qualified. | `TEST-DEF-01` | **RESOLVED** |

---

## 2. Detalle de Implementación Técnica

### 2.1 Migración de Seguridad (`20260908000006_security_hardening_profiles.sql`)

1. **Trigger de Integridad de Columnas Sensibles (`public.protect_profile_sensitive_columns`)**:
   - Impide la modificación de la clave primaria (`id`).
   - Verifica el rol del usuario ejecutor en `public.profiles`. Si no posee rol `'admin'`, cualquier intento de modificar la columna `role` resulta en una excepción de base de datos (`RAISE EXCEPTION 'Changing role is restricted to system administrators.'`).
   - Bloquea cualquier `UPDATE` directo sobre `xp` y `level_title` originado desde PostgREST cliente. Se exige la invocación del RPC oficial o contexto de sistema.

2. **RPC de Otorgamiento de XP Server-Side (`public.award_user_xp`)**:
   - Parámetro: `p_xp_to_add INTEGER` (validado entre 1 y 1000).
   - Identity Constraint: `v_user_id := auth.uid()`.
   - Lógica de Nivel Calculada en Servidor:
     - `< 100 XP`: `Cocinero Novato 🌾`
     - `< 300 XP`: `Explorador de Sabores 🌶️`
     - `< 600 XP`: `Maestro del Fuego 🔥`
     - `>= 600 XP`: `Leyenda Taragüí 👑`
   - Configura sesión local autenticada para autorizar la actualización en el trigger.

3. **Restricción de Privilegios de Tabla `trivia_questions`**:
   - `REVOKE SELECT ON public.trivia_questions FROM anon, authenticated;`
   - `GRANT SELECT ON public.client_trivia_questions TO anon, authenticated;`
   - `GRANT SELECT ON public.trivia_answers TO anon, authenticated;`

4. **Fijación de `search_path` en Funciones `SECURITY DEFINER`**:
   - `public.is_editor()`: `SET search_path = ''`
   - `public.is_admin()`: `SET search_path = ''`
   - `public.process_audit_log()`: `SET search_path = ''`
   - `public.award_user_xp()`: `SET search_path = ''`

---

### 2.2 Frontend Whitelist DTO (`profileRepository.ts`)

Se refactorizó el repositorio cliente para eliminar cualquier asignación masiva no sanitizada:

```typescript
export interface UpdateProfileDto {
  display_name?: string;
  avatar_url?: string;
}

// updateProfile filtra explícitamente solo display_name y avatar_url
// updateXP invoca exclusivamente el RPC server-side award_user_xp
```

---

## 3. Pruebas de Seguridad Ejecutadas (DB Security Suite)

| ID Prueba | Descripción | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|
| `TEST-ROLE-01` | `USER_A` intenta cambiar su rol a `admin` | Rechazado por Trigger | Excepción: *Changing role is restricted to system administrators.* | **PASS** |
| `TEST-ROLE-02` | `USER_A` intenta cambiar su rol a `editor` | Rechazado por Trigger | Excepción: *Changing role is restricted to system administrators.* | **PASS** |
| `TEST-ROLE-03` | `USER_A` intenta cambiar el rol de `USER_B` | Rechazado por RLS / Trigger | 0 filas afectadas / Excepción | **PASS** |
| `TEST-ROLE-04` | `ADMIN` cambia el rol de `USER_B` a `editor` | Permitido | Rol de `USER_B` actualizado exitosamente a `editor` | **PASS** |
| `TEST-ID-01` | `USER_A` intenta cambiar la columna `id` de su perfil | Rechazado por Trigger | Excepción: *Modifying profile primary key (id) is strictly forbidden.* | **PASS** |
| `TEST-XP-01` | `USER_A` ejecuta `UPDATE profiles SET xp = 9999999` directo | Rechazado por Trigger | Excepción: *Direct client modification of xp and level_title is forbidden.* | **PASS** |
| `TEST-XP-02` | `USER_A` ejecuta `UPDATE profiles SET level_title = 'Gran Maestro'` directo | Rechazado por Trigger | Excepción: *Direct client modification of xp and level_title is forbidden.* | **PASS** |
| `TEST-XP-03` | `USER_A` envía Mass Assignment Payload con `role`, `xp`, `level_title` | Rechazado | Payload bloqueado por el trigger | **PASS** |
| `TEST-XP-04` | `USER_A` invoca `award_user_xp(150)` RPC | Permitido | XP incrementado y `level_title` calculado en servidor | **PASS** |
| `TEST-TRIVIA-01` | `authenticated` intenta `SELECT` directo a `public.trivia_questions` | Rechazado por Permisos | Excepción: *permission denied for table trivia_questions* | **PASS** |
| `TEST-TRIVIA-02` | `authenticated` realiza `SELECT` a `public.client_trivia_questions` | Permitido | Consulta exitosa sin exponer `correct_answer_idx` | **PASS** |
| `TEST-DEF-01` | Verificación de `search_path` en funciones `SECURITY DEFINER` | Validado | Todas las funciones tienen `search_path=''` configurado | **PASS** |

---

## 4. Resumen Global de Seguridad

- **CRITICAL**: **RESOLVED**
- **HIGH**: **RESOLVED**
- **MEDIUM**: **RESOLVED**

### Archivos Modificados
- [`src/services/repositories/profileRepository.ts`](file:///f:/Feria2026/Sabores%204.0/src/services/repositories/profileRepository.ts)
- [`supabase/tests/03_roles_privilege_escalation.test.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/tests/03_roles_privilege_escalation.test.sql)
- [`supabase/tests/04_xp_integrity.test.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/tests/04_xp_integrity.test.sql)

### Migraciones Creadas
- [`supabase/migrations/20260908000006_security_hardening_profiles.sql`](file:///f:/Feria2026/Sabores%204.0/supabase/migrations/20260908000006_security_hardening_profiles.sql)

### Reportes Generados
- [`docs/security/SECURITY_HARDENING_PROFILES_REPORT.md`](file:///f:/Feria2026/Sabores%204.0/docs/security/SECURITY_HARDENING_PROFILES_REPORT.md)

---

## 5. Verificación de Regresión de Aplicación

- **TypeScript Compilation**: `npx tsc --noEmit` -> **PASS** (0 errores).
- **Expo Web Export**: `npx expo export --platform web` -> **PASS** (Bundled estático sin errores).
