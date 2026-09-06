import { describe, it, expect } from 'vitest';
import { LEVEL_THRESHOLDS, calculateLevelAndProgress } from '../../services/data.service';

describe('Centralized Level ↔ XP Progression System', () => {
  it('contains monotonic thresholds with progressively increasing requirements', () => {
    expect(LEVEL_THRESHOLDS.length).toBe(14);

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      const cur = LEVEL_THRESHOLDS[i];
      expect(cur.level).toBe(i + 1);
      expect(cur.name).toBeTruthy();
      expect(cur.minXp).toBeLessThanOrEqual(cur.maxXp);

      if (i < LEVEL_THRESHOLDS.length - 1) {
        const next = LEVEL_THRESHOLDS[i + 1];
        expect(cur.nextThreshold).toBe(next.minXp);
        expect(cur.maxXp).toBe(next.minXp - 1);
      }
    }
  });

  it('correctly maps all required XP milestones from specifications', () => {
    // 0 XP -> Level 1 (Newcomer)
    const l0 = calculateLevelAndProgress(0);
    expect(l0.level).toBe(1);
    expect(l0.levelTitle).toBe('Newcomer');
    expect(l0.currentLevelXp).toBe(0);
    expect(l0.levelSpan).toBe(100);
    expect(l0.xpNeeded).toBe(100);
    expect(l0.progressPercent).toBe(0);

    // 50 XP -> Level 1 (Newcomer)
    const l50 = calculateLevelAndProgress(50);
    expect(l50.level).toBe(1);
    expect(l50.levelTitle).toBe('Newcomer');
    expect(l50.currentLevelXp).toBe(50);
    expect(l50.xpNeeded).toBe(50);
    expect(l50.progressPercent).toBe(50);

    // 100 XP -> Level 2 (Beginner)
    const l100 = calculateLevelAndProgress(100);
    expect(l100.level).toBe(2);
    expect(l100.levelTitle).toBe('Beginner');
    expect(l100.currentLevelXp).toBe(0);
    expect(l100.levelSpan).toBe(150);
    expect(l100.xpNeeded).toBe(150);
    expect(l100.progressPercent).toBe(0);

    // 249 XP -> Level 2 (Beginner, 1 XP before Level 3)
    const l249 = calculateLevelAndProgress(249);
    expect(l249.level).toBe(2);
    expect(l249.levelTitle).toBe('Beginner');
    expect(l249.currentLevelXp).toBe(149);
    expect(l249.xpNeeded).toBe(1);
    expect(l249.progressPercent).toBeCloseTo(99.33, 1);

    // 250 XP -> Level 3 (Learner)
    const l250 = calculateLevelAndProgress(250);
    expect(l250.level).toBe(3);
    expect(l250.levelTitle).toBe('Learner');
    expect(l250.currentLevelXp).toBe(0);
    expect(l250.levelSpan).toBe(200);
    expect(l250.xpNeeded).toBe(200);

    // 449 XP -> Level 3 (Learner, 1 XP before Level 4)
    const l449 = calculateLevelAndProgress(449);
    expect(l449.level).toBe(3);
    expect(l449.levelTitle).toBe('Learner');
    expect(l449.currentLevelXp).toBe(199);
    expect(l449.xpNeeded).toBe(1);

    // 450 XP -> Level 4 (Explorer)
    const l450 = calculateLevelAndProgress(450);
    expect(l450.level).toBe(4);
    expect(l450.levelTitle).toBe('Explorer');
    expect(l450.currentLevelXp).toBe(0);
    expect(l450.levelSpan).toBe(250);
    expect(l450.xpNeeded).toBe(250);

    // 699 XP -> Level 4 (Explorer, 1 XP before Level 5)
    const l699 = calculateLevelAndProgress(699);
    expect(l699.level).toBe(4);
    expect(l699.levelTitle).toBe('Explorer');
    expect(l699.currentLevelXp).toBe(249);
    expect(l699.xpNeeded).toBe(1);

    // 700 XP -> Level 5 (Achiever)
    const l700 = calculateLevelAndProgress(700);
    expect(l700.level).toBe(5);
    expect(l700.levelTitle).toBe('Achiever');
    expect(l700.currentLevelXp).toBe(0);
    expect(l700.levelSpan).toBe(300);
    expect(l700.xpNeeded).toBe(300);
    expect(l700.progressPercent).toBe(0);

    // 720 XP -> Level 5 (Achiever - exact user specification example)
    const l720 = calculateLevelAndProgress(720);
    expect(l720.level).toBe(5);
    expect(l720.levelTitle).toBe('Achiever');
    expect(l720.currentLevelXp).toBe(20); // 720 - 700
    expect(l720.levelSpan).toBe(300); // 1000 - 700
    expect(l720.xpNeeded).toBe(280); // 1000 - 720
    expect(l720.progressPercent).toBe(6.67); // 20 / 300 = 6.67%

    // 999 XP -> Level 5 (Achiever, 1 XP before Level 6)
    const l999 = calculateLevelAndProgress(999);
    expect(l999.level).toBe(5);
    expect(l999.levelTitle).toBe('Achiever');
    expect(l999.currentLevelXp).toBe(299);
    expect(l999.xpNeeded).toBe(1);

    // 1000 XP -> Level 6 (Scholar)
    const l1000 = calculateLevelAndProgress(1000);
    expect(l1000.level).toBe(6);
    expect(l1000.levelTitle).toBe('Scholar');
    expect(l1000.currentLevelXp).toBe(0);
    expect(l1000.levelSpan).toBe(350);
    expect(l1000.xpNeeded).toBe(350);
    expect(l1000.nextThreshold).toBe(1350);

    // 1350 XP -> Level 7 (Expert)
    const l1350 = calculateLevelAndProgress(1350);
    expect(l1350.level).toBe(7);
    expect(l1350.levelTitle).toBe('Expert');
    expect(l1350.currentLevelXp).toBe(0);
    expect(l1350.levelSpan).toBe(400);
    expect(l1350.xpNeeded).toBe(400);
    expect(l1350.nextThreshold).toBe(1750);
  });

  it('handles edge cases safely (0 XP, negative, and maximum level)', () => {
    const neg = calculateLevelAndProgress(-100);
    expect(neg.level).toBe(1);
    expect(neg.totalXp).toBe(0);

    const maxLvl = calculateLevelAndProgress(100000);
    expect(maxLvl.level).toBe(14);
    expect(maxLvl.levelTitle).toBe('Transcendent');
    expect(maxLvl.isMaxLevel).toBe(true);
    expect(maxLvl.xpNeeded).toBe(0);
    expect(maxLvl.progressPercent).toBe(100);
  });
});
