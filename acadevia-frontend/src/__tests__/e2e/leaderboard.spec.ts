import { test, expect } from '@playwright/test';

const mockLeaderboardData = {
  global: [
    { rank: 1, userId: 'u1', name: 'Alice', xp: 9500, avatar: '/avatars/alice.png', change: 0 },
    { rank: 2, userId: 'u2', name: 'Bob', xp: 8900, avatar: '/avatars/bob.png', change: 1 },
    { rank: 3, userId: 'u3', name: 'Charlie', xp: 8200, avatar: '/avatars/charlie.png', change: -1 },
  ],
  course: [
    { rank: 1, userId: 'u3', name: 'Charlie', xp: 3200, avatar: '/avatars/charlie.png', change: 2 },
    { rank: 2, userId: 'u1', name: 'Alice', xp: 2900, avatar: '/avatars/alice.png', change: -1 },
    { rank: 3, userId: 'u4', name: 'Diana', xp: 2500, avatar: '/avatars/diana.png', change: 0 },
  ],
  weekly: [
    { rank: 1, userId: 'u2', name: 'Bob', xp: 1200, avatar: '/avatars/bob.png', change: 3 },
    { rank: 2, userId: 'u4', name: 'Diana', xp: 1100, avatar: '/avatars/diana.png', change: -1 },
    { rank: 3, userId: 'u1', name: 'Alice', xp: 950, avatar: '/avatars/alice.png', change: 0 },
  ],
};

test.describe('Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: { id: 'u1', email: 'student@acadevia.in', name: 'Alice' },
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh',
            isAuthenticated: true,
          },
        })
      );
    });

    await page.route('**/api/leaderboard*', (route) => {
      const url = new URL(route.request().url());
      const scope = url.searchParams.get('scope') || 'global';
      const data = mockLeaderboardData[scope as keyof typeof mockLeaderboardData] || mockLeaderboardData.global;

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ entries: data }),
      });
    });
  });

  test('navigates to leaderboard and displays entries', async ({ page }) => {
    await page.goto('/leaderboard');

    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText('Charlie')).toBeVisible();
    await expect(page.getByText(/9[,.]?500/)).toBeVisible();
  });

  test('switches scope tabs and updates table', async ({ page }) => {
    await page.goto('/leaderboard');

    // Default global tab
    await expect(page.getByText(/9[,.]?500/)).toBeVisible();

    // Switch to weekly
    const weeklyTab = page.getByRole('tab', { name: /weekly/i });
    await weeklyTab.click();

    await expect(page.getByText(/1[,.]?200/)).toBeVisible({ timeout: 5000 });

    // Switch to course
    const courseTab = page.getByRole('tab', { name: /course/i });
    await courseTab.click();

    await expect(page.getByText(/3[,.]?200/)).toBeVisible({ timeout: 5000 });
  });

  test('table updates reflect different rankings per scope', async ({ page }) => {
    await page.goto('/leaderboard');

    // Global: Alice is #1
    const aliceGlobalRow = page.getByText('Alice').first();
    await expect(aliceGlobalRow).toBeVisible();

    // Switch to weekly: Bob is #1
    const weeklyTab = page.getByRole('tab', { name: /weekly/i });
    await weeklyTab.click();

    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText(/1[,.]?200/)).toBeVisible({ timeout: 5000 });
  });
});
