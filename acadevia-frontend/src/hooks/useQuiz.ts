import { useQuery, useMutation } from '@tanstack/react-query';
import { quizService } from '@/services/quiz.service';
import type { QuizAttempt } from '@/types/quiz.types';

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data } = await quizService.getById(quizId);
      return data.data;
    },
    enabled: !!quizId,
  });
}

export function useQuizQuestions(quizId: string) {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      const { data } = await quizService.getQuestions(quizId);
      return data.data;
    },
    enabled: !!quizId,
  });
}

export function useSubmitQuiz(quizId: string) {
  return useMutation({
    mutationFn: (attempt: QuizAttempt) => quizService.submit(quizId, attempt),
  });
}
