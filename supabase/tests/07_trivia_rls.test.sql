-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 07: Trivia Protection & Answer Secrecy Audit
-- ====================================================================

BEGIN;

INSERT INTO public.trivia_questions (id, question_code, difficulty, question, explanation, correct_answer_idx, is_published)
VALUES ('00000000-0000-0000-0000-000000000001', 'q_secret', 'Fácil', '¿Cuál es la capital de Corrientes?', 'Corrientes Capital', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Context 1: Anonymous User
SET LOCAL request.jwt.claims = '{"role": "anon"}';

-- Query view (Should succeed and NOT return correct_answer_idx column)
SELECT * FROM public.client_trivia_questions WHERE question_code = 'q_secret';

-- Query underlying table directly (Audit: checks if correct_answer_idx is exposed via direct SQL SELECT)
SELECT id, question, correct_answer_idx FROM public.trivia_questions WHERE question_code = 'q_secret';

-- Context 2: Authenticated Normal User
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- Attempt to UPDATE trivia question (Should fail)
UPDATE public.trivia_questions SET question = 'Hackeado' WHERE question_code = 'q_secret';

ROLLBACK;
