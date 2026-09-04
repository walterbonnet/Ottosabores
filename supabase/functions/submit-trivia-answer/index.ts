import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { questionId, questionCode, selectedOptionIndex, userId } = await req.json();

    if (!selectedOptionIndex && selectedOptionIndex !== 0) {
      return new Response(
        JSON.stringify({ error: "selectedOptionIndex is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch question securely using service role (bypassing public column restriction)
    let query = supabase.from("trivia_questions").select("id, correct_answer_idx, explanation");
    if (questionId) {
      query = query.eq("id", questionId);
    } else if (questionCode) {
      query = query.eq("question_code", questionCode);
    }

    const { data: questionData, error: questionError } = await query.single();

    if (questionError || !questionData) {
      return new Response(
        JSON.stringify({ error: "Question not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isCorrect = questionData.correct_answer_idx === selectedOptionIndex;

    // Log user score if authenticated
    if (userId) {
      await supabase.from("trivia_history").insert({
        user_id: userId,
        score: isCorrect ? 1 : 0,
        total: 1,
      });
    }

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
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
