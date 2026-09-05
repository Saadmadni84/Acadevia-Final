import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

const existingTeacherQuiz = {
  id: 'quiz-10-math-1',
  title: 'Quadratic Equations & Discriminants',
  chapter: 'Quadratic Equations',
  questions: [
    {
      id: 'q1',
      question: 'What is the discriminant of the quadratic equation x² + 5x + 6 = 0?',
      options: ['1', '25', '36', '11'],
      correctIndex: 0,
      explanation: 'Discriminant D = b² - 4ac = 25 - 4(1)(6) = 25 - 24 = 1.',
      points: 10,
    },
  ],
  timeLimit: 300,
};

describe('QuizPlayer with Existing Teacher-Created Quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders existing teacher question and options cleanly without regression', () => {
    const { container } = render(
      <QuizPlayer
        title={existingTeacherQuiz.title}
        chapter={existingTeacherQuiz.chapter}
        questions={existingTeacherQuiz.questions}
        timeLimit={existingTeacherQuiz.timeLimit}
        onComplete={vi.fn()}
      />
    );

    expect(container.textContent).toContain('What is the discriminant of the quadratic equation x² + 5x + 6 = 0?');
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('25');
    expect(container.textContent).toContain('36');
    expect(container.textContent).toContain('11');
  });

  it('completes the quiz seamlessly', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <QuizPlayer
        title={existingTeacherQuiz.title}
        chapter={existingTeacherQuiz.chapter}
        questions={existingTeacherQuiz.questions}
        timeLimit={existingTeacherQuiz.timeLimit}
        onComplete={onComplete}
      />
    );

    // Select Option A ('1')
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    // Explanation should display
    expect(container.textContent).toContain('Discriminant D = b² - 4ac = 25 - 4(1)(6) = 25 - 24 = 1.');

    // Click Finish Quiz
    const finishBtn = Array.from(buttons).find((b) => b.textContent?.includes('Finish Quiz'));
    expect(finishBtn).toBeTruthy();
    if (finishBtn) {
      fireEvent.click(finishBtn);
    }

    // Check completion results
    expect(container.textContent).toContain('100%');
    expect(container.textContent).toContain('1/1 correct');
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 10,
        totalPoints: 10,
        answers: [0],
      })
    );
  });
});
