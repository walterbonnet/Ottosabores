import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // 1. REJECT MISSING / INVALID AUTHORIZATION HEADER (EDGE-01, EDGE-02)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. VERIFY JWT & DERIVE USER IDENTITY EXCLUSIVELY FROM SUPABASE AUTH (EDGE-03, EDGE-04)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid, expired, or unverified JWT token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. STRICT INPUT VALIDATION & SANITIZATION (EDGE-07)
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(
        JSON.stringify({ error: "Bad Request: Malformed JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { questionId, questionCode, selectedOptionIndex } = body;

    // Validate Question identifier
    const targetCode = typeof questionCode === "string" ? questionCode.trim() : null;
    const targetId = typeof questionId === "string" ? questionId.trim() : null;

    if (!targetCode && !targetId) {
      return new Response(
        JSON.stringify({ error: "Bad Request: Valid questionCode or questionId string is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate selectedOptionIndex strictly (integer >= 0 and <= 20)
    if (
      typeof selectedOptionIndex !== "number" ||
      !Number.isInteger(selectedOptionIndex) ||
      selectedOptionIndex < 0 ||
      selectedOptionIndex > 20
    ) {
      return new Response(
        JSON.stringify({ error: "Bad Request: selectedOptionIndex must be an integer between 0 and 20" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. RATE LIMITING / FREQUENCY PROTECTION (EDGE-07)
    // Limit submission rate to maximum 15 trivia answers per 60 seconds per user
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count: recentSubmissions, error: countError } = await userClient
      .from("trivia_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("played_at", oneMinuteAgo);

    if (!countError && recentSubmissions !== null && recentSubmissions >= 15) {
      return new Response(
        JSON.stringify({ error: "Too Many Requests: Rate limit exceeded. Please wait before submitting more answers." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. ISOLATED SERVICE ROLE ACCESS: FETCH CORRECT ANSWER SECURELY (EDGE-05)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    let query = serviceClient.from("trivia_questions").select("id, correct_answer_idx, explanation");

    if (targetId) {
      query = query.eq("id", targetId);
    } else {
      query = query.eq("question_code", targetCode);
    }

    const { data: questionData, error: questionError } = await query
      .eq("is_published", true)
      .single();

    if (questionError || !questionData) {
      return new Response(
        JSON.stringify({ error: "Not Found: Question does not exist or is unpublished" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. BACKEND-ONLY SCORE CALCULATION & USER-SCOPED HISTORY INSERT (EDGE-03, EDGE-05)
    const isCorrect = questionData.correct_answer_idx === selectedOptionIndex;
    const scoreValue = isCorrect ? 1 : 0;

    // Insert history using userClient (Enforces RLS auth.uid() = user_id AND uses verified user.id)
    const { error: insertError } = await userClient.from("trivia_history").insert({
      user_id: user.id,
      score: scoreValue,
      total: 1,
    });

    if (insertError) {
      console.warn("Error recording trivia history:", insertError.message);
    }

    // 7. RETURN CONTROLLED SECURE RESPONSE
    return new Response(
      JSON.stringify({
        isCorrect,
        correctAnswerIndex: questionData.correct_answer_idx,
        explanation: questionData.explanation,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error: Execution failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
