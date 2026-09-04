# Sabores 4.0 – Matriz de Pruebas de Seguridad (Security Test Matrix)

Esta matriz mapea cada vector de riesgo con su prueba de script SQL en `supabase/tests/` y su criterio de aceptación.

---

## 📋 Matriz de Control de Calidad de Seguridad

| ID Prueba | Script de Prueba SQL | Objetivo del Test | Caso de Uso / Vector Evaluado | Criterio de Aceptación (PASS) | Severidad |
|---|---|---|---|---|---|
| **SEC-00** | `00_security_inventory.test.sql` | Inventario de Seguridad | Verificación de RLS activo en las 25 tablas y grants SQL | RLS activo en 100% de tablas | INFO |
| **SEC-01** | `01_profiles_rls.test.sql` | Perfiles & RLS | UPDATE propio en `profiles` no debe permitir cambiar `role` o `xp` | Denegar cambio de `role` y `xp` | CRITICAL |
| **SEC-02** | `02_user_isolation.test.sql` | Aislamiento entre Usuarios | USER_A no debe leer ni alterar datos de USER_B | 0 filas retornadas / DENIED | HIGH |
| **SEC-03** | `03_roles_privilege_escalation.test.sql` | Escalada de Privilegios | USER_A no debe poder cambiar su rol a `editor` ni `admin` | Rol permanece como `user` | CRITICAL |
| **SEC-04** | `04_xp_integrity.test.sql` | Integridad de Gamificación | Modificación directa de `xp` desde cliente debe ser rechazada | `xp` no se modifica por SQL directo | HIGH |
| **SEC-05** | `05_favorites_rls.test.sql` | IDOR en Favoritos | USER_A no debe agregar favoritos a nombre de USER_B | RLS check violation / FAIL insert | HIGH |
| **SEC-06** | `06_progress_rls.test.sql` | IDOR en Progreso de Recetas | USER_A no debe alterar el progreso de lectura de USER_B | 0 filas modificadas | HIGH |
| **SEC-07** | `07_trivia_rls.test.sql` | Filtrado de Respuestas Trivia | `correct_answer_idx` no debe ser visible directamente en SELECT público | Columna protegida o no accesible | MEDIUM |
| **SEC-08** | `08_recipes_rls.test.sql` | Control de Publicación | USER normal no debe poder insertar recetas ni publicar borradores | Operación denegada por RLS | HIGH |
| **SEC-09** | `09_storage_security.test.sql` | Seguridad de Storage | Subida a `profiles` debe validar que la ruta coincida con `auth.uid()` | Requerir prefijo de ruta de usuario | MEDIUM |
| **SEC-10** | `10_audit_security.test.sql` | Integridad de Auditoría | Solo Admins leen `audit_logs`, inyección de logs manual denegada | Lectura pública denegada | MEDIUM |
