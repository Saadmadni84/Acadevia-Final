import { test, expect } from '@playwright/test';

test.describe('Course Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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
  });

  test('navigates to courses page', async ({ page }) => {
    await page.route('**/api/courses*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          courses: [
            {
              id: 'c1',
              title: 'Introduction to React',
              teacher: 'Dr. Sarah Chen',
              rating: 4.7,
              enrolled: false,
              thumbnail: '/assets/courses/react.png',
            },
            {
              id: 'c2',
              title: 'Advanced TypeScript',
              teacher: 'Prof. James Lee',
              rating: 4.9,
              enrolled: false,
              thumbnail: '/assets/courses/ts.png',
            },
          ],
        }),
      })
    );

    await page.goto('/courses');
    await expect(page.getByText('Introduction to React')).toBeVisible();
    await expect(page.getByText('Advanced TypeScript')).toBeVisible();
  });

  test('clicks a course card and views course details', async ({ page }) => {
    await page.route('**/api/courses*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          courses: [
            { id: 'c1', title: 'Introduction to React', teacher: 'Dr. Sarah Chen', rating: 4.7, enrolled: false },
          ],
        }),
      })
    );

    await page.route('**/api/courses/c1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'c1',
          title: 'Introduction to React',
          description: 'Learn React from scratch',
          teacher: 'Dr. Sarah Chen',
          lessons: 12,
          enrolled: false,
        }),
      })
    );

    await page.goto('/courses');
    await page.getByText('Introduction to React').click();

    await expect(page.getByText(/learn react|introduction to react/i)).toBeVisible();
  });

  test('clicks Enroll button and verifies enrollment success', async ({ page }) => {
    await page.route('**/api/courses/c1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'c1',
          title: 'Introduction to React',
          description: 'Learn React from scratch',
          teacher: 'Dr. Sarah Chen',
          enrolled: false,
        }),
      })
    );

    await page.route('**/api/courses/c1/enroll', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Successfully enrolled' }),
      })
    );

    await page.goto('/courses/c1');

    const enrollButton = page.getByRole('button', { name: /enroll/i });
    await expect(enrollButton).toBeVisible();
    await enrollButton.click();

    await expect(
      page.getByText(/successfully enrolled|enrollment confirmed|enrolled/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
