import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('navigates to /login and renders form', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in|submit/i })).toBeVisible();
  });

  test('fills credentials, clicks submit, and redirects to dashboard on success', async ({
    page,
  }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'u1', email: 'student@acadevia.in', name: 'Test Student' },
          tokens: { accessToken: 'token-123', refreshToken: 'refresh-456' },
        }),
      })
    );

    await page.getByLabel(/email/i).fill('student@acadevia.in');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password' }),
      })
    );

    await page.getByLabel(/email/i).fill('wrong@acadevia.in');
    await page.getByLabel(/password/i).fill('WrongPassword');
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();

    await expect(
      page.getByText(/invalid|incorrect|wrong.*credentials|failed/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
