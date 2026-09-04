import { supabase, isSupabaseConfigured } from '../supabase/client';
import { TRIVIA_QUESTIONS } from '../mockData';
import { TriviaQuestion } from '../../types';

export interface PublicTriviaQuestion {
  id: string;
  question: string;
  options: string[];
  explanation?: string;
  image?: string;
  difficulty: string;
}

export interface TriviaValidationResult {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
}

export const triviaRepository = {
  async getQuestions(): Promise<TriviaQuestion[]> {
    if (!isSupabaseConfigured || !supabase) {
      return TRIVIA_QUESTIONS;
    }

    try {
      // Query from client_trivia_questions view (which excludes correct_answer_idx for security)
      const { data, error } = await supabase
        .from('client_trivia_questions')
        .select('*, trivia_answers(*)');

      if (error || !data || data.length === 0) {
        return TRIVIA_QUESTIONS;
      }

      return data.map((row: any) => {
        const options = (row.trivia_answers || [])
          .sort((a: any, b: any) => a.option_index - b.option_index)
          .map((o: any) => o.option_text);

        const mockMatch = TRIVIA_QUESTIONS.find(q => q.id === row.question_code || q.id === row.id);

        return {
          id: row.question_code || row.id,
          question: row.question,
          options: options.length > 0 ? options : (mockMatch?.options || []),
          correctAnswer: mockMatch?.correctAnswer || 0, // Fallback for offline/local simulation
          explanation: row.explanation,
          image: row.image_url || mockMatch?.image,
        };
      });
    } catch (err) {
      return TRIVIA_QUESTIONS;
    }
  },

  async submitAnswer(
    questionId: string,
    selectedOptionIndex: number,
    userId?: string
  ): Promise<TriviaValidationResult> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback for local mock validation
      const mockQuestion = TRIVIA_QUESTIONS.find(q => q.id === questionId);
      const isCorrect = mockQuestion ? mockQuestion.correctAnswer === selectedOptionIndex : false;
      return {
        isCorrect,
        correctAnswer: mockQuestion ? mockQuestion.correctAnswer : 0,
        explanation: mockQuestion ? mockQuestion.explanation : '',
      };
    }

    try {
      // Invoke secure Edge Function for server-side trivia validation
      const { data, error } = await supabase.functions.invoke('submit-trivia-answer', {
        body: {
          questionCode: questionId,
          selectedOptionIndex,
          userId,
        },
      });

      if (error || !data) {
        const mockQuestion = TRIVIA_QUESTIONS.find(q => q.id === questionId);
        return {
          isCorrect: mockQuestion ? mockQuestion.correctAnswer === selectedOptionIndex : false,
          correctAnswer: mockQuestion ? mockQuestion.correctAnswer : 0,
          explanation: mockQuestion ? mockQuestion.explanation : '',
        };
      }

      return {
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswerIndex,
        explanation: data.explanation,
      };
    } catch (err) {
      const mockQuestion = TRIVIA_QUESTIONS.find(q => q.id === questionId);
      return {
        isCorrect: mockQuestion ? mockQuestion.correctAnswer === selectedOptionIndex : false,
        correctAnswer: mockQuestion ? mockQuestion.correctAnswer : 0,
        explanation: mockQuestion ? mockQuestion.explanation : '',
      };
    }
  },
};
