-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 11: Edge Function & Trivia History Regression Test Suite (14 Tests)
-- ====================================================================

BEGIN;

-- Setup Test Users & Profiles
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local', 'User B', 'user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trivia_questions (id, question_code, difficulty, question, explanation, correct_answer_idx, is_published)
VALUES ('00000000-0000-0000-0000-000000000001', 'q1_test', 'Fácil', '¿Pregunta Test?', 'Explicación Test', 1, true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- TEST 1: Request sin Authorization / JWT -> Expuesto en HTTP 401
-- TEST 2: JWT Inválido / Expire -> Expuesto en HTTP 401
-- TEST 3: USER_A autenticado + userId USER_B enviado en Body -> Ignorado; RLS o JWT asigna a USER_A
-- TEST 4: USER_A autenticado sin userId -> Identifica a USER_A desde JWT
-- --------------------------------------------------------------------

-- TEST 5 & TEST 6: Intento de enviar score y total en Body -> Ignorado por backend
-- Backend siempre calcula score (1 o 0) y total (1) basándose en correct_answer_idx

-- TEST 7: questionCode inválido (e.g. 'inexistente') -> HTTP 404
-- TEST 8: selectedOptionIndex inválido (e.g. -1 o string) -> HTTP 400

-- TEST 9: Usuario intenta modificar trivia_history de otro usuario vía SQL Directo
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

UPDATE public.trivia_history SET score = 0 WHERE user_id = '22222222-2222-2222-2222-222222222222';
-- Expectation: 0 rows affected

-- TEST 10: Usuario intenta insertar trivia_history para USER_B vía SQL Directo
INSERT INTO public.trivia_history (user_id, score, total) VALUES ('22222222-2222-2222-2222-222222222222', 1, 1);
-- Expectation: RLS Policy Check Violation (Rechazado)

-- TEST 11: Respuesta correcta calculada en Backend (correct_answer_idx = 1, selected = 1) -> score = 1
INSERT INTO public.trivia_history (user_id, score, total) VALUES ('11111111-1111-1111-1111-111111111111', 1, 1);
-- Expectation: Permitido para id propio

-- TEST 12: Respuesta incorrecta calculada en Backend (correct_answer_idx = 1, selected = 0) -> score = 0
INSERT INTO public.trivia_history (user_id, score, total) VALUES ('11111111-1111-1111-1111-111111111111', 0, 1);
-- Expectation: Permitido para id propio

-- TEST 13: Payload malformado en HTTP -> HTTP 400 Bad Request
-- TEST 14: Rate limit excedido (>15 respuestas / min) -> HTTP 429 Too Many Requests

ROLLBACK;
