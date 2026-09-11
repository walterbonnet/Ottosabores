import { supabase, isSupabaseConfigured } from '../supabase/client';
import { TRIVIA_QUESTIONS } from '../mockData';
import { TriviaQuestion, TriviaOptionRow } from '../../types';
import { Logger } from '../logger';
import { Result, createSuccessResult, createErrorResult } from '../errors/AppError';

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
  async getQuestionsResult(): Promise<Result<TriviaQuestion[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return createSuccessResult(TRIVIA_QUESTIONS, true);
    }

    try {
      const { data, error } = await supabase
        .from('client_trivia_questions')
        .select('*, trivia_answers(*)');

      if (error) {
        Logger.warn('triviaRepository.getQuestionsResult error:', error);
        return createErrorResult('SERVER_ERROR', error.message, true, error);
      }

      if (!data || data.length === 0) {
        return createSuccessResult([], false);
      }

      const questions = data.map((row) => {
        const answers = (row.trivia_answers as TriviaOptionRow[]) || [];
        const options = answers
          .sort((a, b) => (a.option_index || 0) - (b.option_index || 0))
          .map((o) => o.option_text);

        const mockMatch = TRIVIA_QUESTIONS.find(q => q.id === row.question_code || q.id === row.id);

        return {
          id: row.question_code || row.id,
          question: row.question,
          options: options.length > 0 ? options : (mockMatch?.options || []),
          correctAnswer: mockMatch?.correctAnswer || 0,
          explanation: row.explanation,
          image: row.image_url || mockMatch?.image,
        };
      });

      return createSuccessResult(questions);
    } catch (err) {
      Logger.warn('triviaRepository.getQuestionsResult exception:', err);
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async getQuestions(): Promise<TriviaQuestion[]> {
    const res = await this.getQuestionsResult();
    if (res.ok && res.data.length > 0) return res.data;
    return TRIVIA_QUESTIONS;
  },


  async submitAnswer(
    questionId: string,
    selectedOptionIndex: number
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
        },
      });

      if (error || !data) {
        Logger.warn('Edge Function submit-trivia-answer failed, using fallback:', error);
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
      Logger.warn('submitAnswer exception:', err);
      const mockQuestion = TRIVIA_QUESTIONS.find(q => q.id === questionId);
      return {
        isCorrect: mockQuestion ? mockQuestion.correctAnswer === selectedOptionIndex : false,
        correctAnswer: mockQuestion ? mockQuestion.correctAnswer : 0,
        explanation: mockQuestion ? mockQuestion.explanation : '',
      };
    }
  },
};
