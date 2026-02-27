import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: { id: 'u1', email: 'student@acadevia.in', name: 'Test Student' },
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh',
            isAuthenticated: true,
          },
        })
      );
    });

    await page.route('**/api/quizzes/quiz-1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'quiz-1',
          title: 'React Basics Quiz',
          questions: [
            {
              id: 'q1',
              text: 'What hook manages state in React?',
              options: ['useEffect', 'useState', 'useRef', 'useMemo'],
              timeLimit: 30,
            },
            {
              id: 'q2',
              text: 'JSX stands for?',
              options: ['JavaScript XML', 'Java Standard Extension', 'JSON XML', 'JavaScript Extension'],
              timeLimit: 30,
            },
          ],
        }),
      })
    );
  });

  test('starts a quiz', async ({ page }) => {
    await page.goto('/quizzes/quiz-1');

    const startButton = page.getByRole('button', { name: /start|begin/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page.getByText('What hook manages state in React?')).toBeVisible();
  });

  test('answers questions and navigates through quiz', async ({ page }) => {
    await page.goto('/quizzes/quiz-1');

    const startButton = page.getByRole('button', { name: /start|begin/i });
    await startButton.click();

    // Answer first question
    await page.getByText('useState').click();
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Verify second question appears
    await expect(page.getByText('JSX stands for?')).toBeVisible();

    // Answer second question
    await page.getByText('JavaScript XML').click();
  });

  test('submits quiz and sees results', async ({ page }) => {
    await page.route('**/api/quizzes/quiz-1/submit', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          score: 100,
          correctAnswers: 2,
          totalQuestions: 2,
          xpEarned: 50,
          badge: null,
        }),
      })
    );

    await page.goto('/quizzes/quiz-1');

    const startButton = page.getByRole('button', { name: /start|begin/i });
    await startButton.click();

    // Answer Q1
    await page.getByText('useState').click();
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Answer Q2 and submit
    await page.getByText('JavaScript XML').click();
    await page.getByRole('button', { name: /submit|finish/i }).click();

    // Verify results
    await expect(page.getByText(/100%|2\/2|perfect/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/50.*xp|xp.*50/i)).toBeVisible();
  });
});
