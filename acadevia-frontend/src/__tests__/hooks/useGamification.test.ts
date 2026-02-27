import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamification } from '@/hooks/useGamification';

const mockAddXP = vi.fn();
const mockUnlockBadge = vi.fn();
const mockQueueAnimation = vi.fn();
const mockDequeueAnimation = vi.fn();

vi.mock('@/stores/useGamificationStore', () => ({
  useGamificationStore: () => ({
    xp: 500,
    level: 5,
    badges: [],
    animationQueue: [],
    addXP: mockAddXP,
    unlockBadge: mockUnlockBadge,
    queueAnimation: mockQueueAnimation,
    dequeueAnimation: mockDequeueAnimation,
  }),
}));

vi.mock('@/services/gamificationService', () => ({
  gamificationService: {
    awardXP: vi.fn().mockResolvedValue({ xp: 550, level: 5 }),
    unlockBadge: vi.fn().mockResolvedValue({ badgeId: 'first-quiz', name: 'Quiz Starter' }),
  },
}));

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addXP() updates store and queues animation', async () => {
    const { result } = renderHook(() => useGamification());

    await act(async () => {
      await result.current.addXP(50, 'quiz_complete');
    });

    expect(mockAddXP).toHaveBeenCalledWith(50);
    expect(mockQueueAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'xp',
        value: 50,
      })
    );
  });

  it('unlockBadge() adds badge and queues celebration', async () => {
    const { result } = renderHook(() => useGamification());

    await act(async () => {
      await result.current.unlockBadge('first-quiz');
    });

    expect(mockUnlockBadge).toHaveBeenCalledWith('first-quiz');
    expect(mockQueueAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'badge',
      })
    );
  });

  it('dequeueAnimation() returns and removes first item', () => {
    const mockAnimation = { type: 'xp', value: 50, id: 'anim-1' };
    mockDequeueAnimation.mockReturnValue(mockAnimation);

    const { result } = renderHook(() => useGamification());

    let animation: unknown;
    act(() => {
      animation = result.current.dequeueAnimation();
    });

    expect(mockDequeueAnimation).toHaveBeenCalled();
    expect(animation).toEqual(mockAnimation);
  });
});
