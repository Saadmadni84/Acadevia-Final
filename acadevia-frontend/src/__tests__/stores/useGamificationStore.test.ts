import { describe, it, expect, beforeEach } from 'vitest';
import { useGamificationStore } from '@/stores/useGamificationStore';

describe('useGamificationStore', () => {
  beforeEach(() => {
    useGamificationStore.setState({
      xp: 0,
      level: 1,
      badges: [],
      animationQueue: [],
    });
  });

  it('addXP increases XP', () => {
    const { addXP } = useGamificationStore.getState();

    addXP(100);
    expect(useGamificationStore.getState().xp).toBe(100);

    addXP(250);
    expect(useGamificationStore.getState().xp).toBe(350);
  });

  it('queueAnimation adds to queue', () => {
    const { queueAnimation } = useGamificationStore.getState();

    const animation1 = { type: 'xp' as const, value: 50, id: 'anim-1' };
    const animation2 = { type: 'badge' as const, badgeId: 'first-quiz', id: 'anim-2' };

    queueAnimation(animation1);
    expect(useGamificationStore.getState().animationQueue).toHaveLength(1);

    queueAnimation(animation2);
    expect(useGamificationStore.getState().animationQueue).toHaveLength(2);
    expect(useGamificationStore.getState().animationQueue[0]).toEqual(animation1);
  });

  it('dequeueAnimation removes from queue', () => {
    const { queueAnimation, dequeueAnimation } = useGamificationStore.getState();

    const animation1 = { type: 'xp' as const, value: 50, id: 'anim-1' };
    const animation2 = { type: 'xp' as const, value: 100, id: 'anim-2' };

    queueAnimation(animation1);
    queueAnimation(animation2);

    const dequeued = dequeueAnimation();
    expect(dequeued).toEqual(animation1);
    expect(useGamificationStore.getState().animationQueue).toHaveLength(1);
    expect(useGamificationStore.getState().animationQueue[0]).toEqual(animation2);
  });

  it('unlockBadge adds badge', () => {
    const { unlockBadge } = useGamificationStore.getState();

    unlockBadge('first-quiz');
    expect(useGamificationStore.getState().badges).toContain('first-quiz');

    unlockBadge('streak-7');
    expect(useGamificationStore.getState().badges).toHaveLength(2);
    expect(useGamificationStore.getState().badges).toContain('streak-7');
  });
});
