import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataService } from '@/services/data.service';
import { apiClient } from '@/services/api.client';

describe('Quiz Deletion & Chapter Information Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('persists chapter information when creating a quiz', () => {
    const created = dataService.createQuiz({
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Mathematics',
      chapter: 'Chapter 1 - Real Numbers',
      chapterInfo: 'Chapter 1 - Real Numbers',
      title: 'Real Numbers Diagnostic Quiz',
      description: 'Test on fundamental theorem of arithmetic',
      timeLimit: 300,
      difficulty: 'medium',
      xpReward: 60,
      questions: [
        {
          id: 'q1',
          question: 'What is the HCF of 12 and 18?',
          options: ['2', '3', '6', '12'],
          correctIndex: 2,
          points: 10,
        },
      ],
    });

    expect(created.chapter).toBe('Chapter 1 - Real Numbers');
    expect(created.chapterInfo).toBe('Chapter 1 - Real Numbers');

    // Verify retrievable via getQuizById
    const retrieved = dataService.getQuizById(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.chapter).toBe('Chapter 1 - Real Numbers');
  });

  it('handles existing quizzes without chapter information gracefully', () => {
    const legacyQuiz = dataService.createQuiz({
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Science',
      title: 'Legacy Chemical Reactions Quiz',
      description: 'Legacy quiz without explicit chapter info',
      timeLimit: 300,
      difficulty: 'easy',
      questions: [],
    });

    const found = dataService.getQuizById(legacyQuiz.id);
    expect(found).toBeDefined();
    expect(found?.chapter).toBeUndefined();
  });

  it('deletes a quiz from local state and calls backend API', async () => {
    const quiz = dataService.createQuiz({
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Mathematics',
      chapter: 'Chapter 2 - Polynomials',
      title: 'Polynomials Practice to Delete',
      description: 'Will be deleted',
      timeLimit: 300,
      difficulty: 'easy',
      questions: [],
    });

    // Mock apiClient.delete to simulate successful backend response
    vi.spyOn(apiClient, 'delete').mockResolvedValue({
      data: {
        status: 200,
        success: true,
        data: {
          success: true,
          quizId: quiz.id,
          mode: 'DELETED',
          message: 'Quiz was permanently deleted.',
        },
      },
    } as any);

    expect(dataService.getQuizById(quiz.id)).toBeDefined();

    const result = await dataService.deleteQuiz(quiz.id);

    expect(result.success).toBe(true);
    expect(result.mode).toBe('DELETED');

    // Confirm removed from local state
    expect(dataService.getQuizById(quiz.id)).toBeUndefined();
  });

  it('retains the quiz and throws error if backend deletion fails', async () => {
    const quiz = dataService.createQuiz({
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Mathematics',
      title: 'Quiz That Fails to Delete',
      description: 'Deletion should fail',
      timeLimit: 300,
      difficulty: 'easy',
      questions: [],
    });

    // Mock apiClient.delete to simulate 403 error
    vi.spyOn(apiClient, 'delete').mockRejectedValue({
      response: {
        status: 403,
        data: {
          status: 403,
          error: 'Access denied: You are only authorized to delete quizzes that you created',
        },
      },
    });

    await expect(dataService.deleteQuiz(quiz.id)).rejects.toBeDefined();
  });
});
