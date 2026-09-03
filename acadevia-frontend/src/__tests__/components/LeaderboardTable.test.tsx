import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';

afterEach(cleanup);

const mockLeaderboardData = [
  { rank: 1, userId: 'u1', name: 'Alice', level: 5, xp: 9500, streak: 10, avatar: '/avatars/alice.png', change: 'same' as const },
  { rank: 2, userId: 'u2', name: 'Bob', level: 4, xp: 8900, streak: 8, avatar: '/avatars/bob.png', change: 'up' as const },
  { rank: 3, userId: 'u3', name: 'Charlie', level: 4, xp: 8200, streak: 6, avatar: '/avatars/charlie.png', change: 'down' as const },
  { rank: 4, userId: 'u4', name: 'Diana', level: 3, xp: 7500, streak: 5, avatar: '/avatars/diana.png', change: 'up' as const, isCurrentUser: true },
  { rank: 5, userId: 'u5', name: 'Eve', level: 3, xp: 6800, streak: 4, avatar: '/avatars/eve.png', change: 'down' as const },
];

describe('LeaderboardTable', () => {
  it('renders leaderboard rows', () => {
    render(<LeaderboardTable entries={mockLeaderboardData} />);

    expect(screen.getAllByText(/Alice/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bob/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Charlie/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Diana/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Eve/).length).toBeGreaterThan(0);

    expect(screen.getByText(/9,500 XP/)).toBeDefined();
  });

  it('highlights current user', () => {
    render(<LeaderboardTable entries={mockLeaderboardData} />);

    expect(screen.getByText(/Diana \(You\)/)).toBeDefined();
  });

  it('renders ranks and XP properly', () => {
    render(<LeaderboardTable entries={mockLeaderboardData} />);

    expect(screen.getAllByText(/Level 5/).length).toBeGreaterThan(0);
    expect(screen.getByText(/9,500 XP/)).toBeDefined();
  });

  it('triggers onSelectStudent when a student row is clicked', () => {
    let selectedId = '';
    const onSelectStudent = (id: string) => {
      selectedId = id;
    };

    render(<LeaderboardTable entries={mockLeaderboardData} onSelectStudent={onSelectStudent} />);

    const aliceRow = screen.getByText(/Alice/).closest('div[role="button"]');
    expect(aliceRow).not.toBeNull();
    aliceRow?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(selectedId).toBe('u1');
  });
});
