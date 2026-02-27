import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeaderboardTable from '@/components/LeaderboardTable';

const mockLeaderboardData = [
  { rank: 1, userId: 'u1', name: 'Alice', xp: 9500, avatar: '/avatars/alice.png', change: 0 },
  { rank: 2, userId: 'u2', name: 'Bob', xp: 8900, avatar: '/avatars/bob.png', change: 1 },
  { rank: 3, userId: 'u3', name: 'Charlie', xp: 8200, avatar: '/avatars/charlie.png', change: -1 },
  { rank: 4, userId: 'u4', name: 'Diana', xp: 7500, avatar: '/avatars/diana.png', change: 2 },
  { rank: 5, userId: 'u5', name: 'Eve', xp: 6800, avatar: '/avatars/eve.png', change: -2 },
];

const currentUserId = 'u4';

describe('LeaderboardTable', () => {
  it('renders leaderboard rows', () => {
    render(<LeaderboardTable data={mockLeaderboardData} currentUserId={currentUserId} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();

    expect(screen.getByText(/9[,.]?500/)).toBeInTheDocument();
  });

  it('highlights current user', () => {
    render(<LeaderboardTable data={mockLeaderboardData} currentUserId={currentUserId} />);

    const dianaRow = screen.getByText('Diana').closest('tr, [role="row"], [class*="row"]');
    expect(dianaRow).toHaveClass(/highlight|current|active/);
  });

  it('shows rank change arrows', () => {
    const { container } = render(
      <LeaderboardTable data={mockLeaderboardData} currentUserId={currentUserId} />
    );

    const upArrows = container.querySelectorAll(
      '[class*="up"], [aria-label*="up"], [data-direction="up"]'
    );
    const downArrows = container.querySelectorAll(
      '[class*="down"], [aria-label*="down"], [data-direction="down"]'
    );

    expect(upArrows.length).toBeGreaterThan(0);
    expect(downArrows.length).toBeGreaterThan(0);
  });

  it('renders top 3 with special styling', () => {
    const { container } = render(
      <LeaderboardTable data={mockLeaderboardData} currentUserId={currentUserId} />
    );

    const topRows = container.querySelectorAll(
      '[class*="gold"], [class*="silver"], [class*="bronze"], [class*="top-"], [class*="podium"]'
    );
    expect(topRows.length).toBeGreaterThanOrEqual(3);
  });
});
