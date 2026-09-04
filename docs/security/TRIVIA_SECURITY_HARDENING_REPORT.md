# Sabores 4.0 – Informe de Hardening de Seguridad (`submit-trivia-answer`)

> [!IMPORTANT]
> **Informe Final de Remediación y Hardening de Seguridad**: Este documento consolida las correcciones aplicadas a los 7 hallazgos detectados durante el Pentest Interno de la Edge Function `submit-trivia-answer`.

---

## 📊 Matriz de Remediación de Seguridad

| Hallazgo | Estado Anterior | Corrección Implementada | Script de Prueba / Control | Resultado Final |
|---|---|---|---|---|
| **EDGE-01** (Falta de Autenticación) | **FAIL** (Aceptaba solicitudes anónimas) | `verify_jwt = true` en `config.toml` + Validación estricta de `Authorization: Bearer <jwt>` | `TEST 1` en `11_trivia_edge_function.test.sql` | **CRITICAL RESOLVED** (HTTP 401) |
| **EDGE-02** (Validación JWT Insuficiente) | **FAIL** (JWT ausente/corrupto ignorado) | Reconciliación con `userClient.auth.getUser()`. Si falla, aborta inmediatamente | `TEST 2` en `11_trivia_edge_function.test.sql` | **HIGH RESOLVED** (HTTP 401) |
| **EDGE-03** (User ID Spoofing) | **FAIL** (Inyección por `body.userId`) | Eliminación de `userId` del cuerpo JSON y del cliente. Identidad obtenida 100% de `user.id` | `TEST 3` & `TEST 4` en `11_trivia_edge_function.test.sql` | **CRITICAL RESOLVED** (Identidad asertiva) |
| **EDGE-04** (Imposibilidad derivar usuario) | **FAIL** (No registraba sin `userId`) | Asignación automática de `user.id` desde el token JWT | `TEST 4` en `11_trivia_edge_function.test.sql` | **MEDIUM RESOLVED** (Historial preservado) |
| **EDGE-05** (Uso irrestricto `service_role`) | **FAIL** (Service Role saltaba RLS en inserción) | Service Role aislado **solo** a lectura de `correct_answer_idx`. Inserción en `trivia_history` usa `userClient` con RLS activo | `TEST 5`, `TEST 6`, `TEST 9`, `TEST 10` | **HIGH RESOLVED** (RLS Aislado) |
| **EDGE-06** (CORS Permisivo) | **FAIL** (CORS global sin control) | Control de preflight OPTIONS y restricción de cabeceras en respuesta | Petición OPTIONS | **MEDIUM RESOLVED** (CORS Controlado) |
| **EDGE-07** (Falta de Input Validation / Rate Limit) | **FAIL** (Fuerza bruta y payloads malformados) | Validación estricta de tipos (`0 <= index <= 20`, integer) + Rate limit persistente en DB (máx 15 respuestas/min) | `TEST 7`, `TEST 8`, `TEST 13`, `TEST 14` | **MEDIUM RESOLVED** (HTTP 400 & 429) |

---

## 📈 Declaración Final de Estado

- **CRITICAL**: **RESOLVED** (2/2)
- **HIGH**: **RESOLVED** (3/3)
- **MEDIUM**: **RESOLVED** (2/2)
- **PENDING**: **NONE (0)**

> [!CAUTION]
> **Nota de Despliegue**: El despliegue se ha validado y probado únicamente en el entorno local/staging. **NO se ha realizado despliegue automático a producción** conforme a las directivas de seguridad.
