import { test, expect } from '@playwright/test';

test.describe('Offline Sync', () => {
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
  });

  test('detects offline state', async ({ page, context }) => {
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Verify offline indicator appears
    await expect(
      page.getByText(/offline|no connection|disconnected/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('performs actions while offline', async ({ page, context }) => {
    await page.route('**/api/courses*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          courses: [
            { id: 'c1', title: 'Cached Course', teacher: 'Teacher', rating: 4.5, enrolled: true, progress: 50 },
          ],
        }),
      })
    );

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Try to navigate and interact (should use cached data)
    await expect(page.getByText(/offline|cached/i)).toBeVisible({ timeout: 5000 });
  });

  test('syncs data when coming back online', async ({ page, context }) => {
    let syncCalled = false;

    await page.route('**/api/sync', (route) => {
      syncCalled = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ synced: true, count: 3 }),
      });
    });

    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // Come back online
    await context.setOffline(false);

    // Verify sync happens
    await page.waitForTimeout(3000);
    expect(syncCalled).toBe(true);
  });

  test('shows sync status indicators', async ({ page, context }) => {
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);
    await expect(
      page.getByText(/offline|disconnected/i)
    ).toBeVisible({ timeout: 5000 });

    // Come back online
    await context.setOffline(false);

    // Should show syncing or online state
    await expect(
      page.getByText(/syncing|online|connected|synced/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
