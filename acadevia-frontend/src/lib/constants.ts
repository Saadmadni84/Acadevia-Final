export const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 7000, 9000, 11500, 14500, 18000, 22000, 27000, 33000, 40000];

export const LEVEL_NAMES = [
  'Beginner', 'Explorer', 'Learner', 'Scholar', 'Achiever',
  'Thinker', 'Analyst', 'Innovator', 'Expert', 'Master',
  'Sage', 'Guru', 'Champion', 'Legend', 'Prodigy',
  'Genius', 'Virtuoso', 'Maestro', 'Luminary', 'Visionary'
];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevelFromXP(xp);
  const currentThreshold = XP_THRESHOLDS[level - 1] || 0;
  const nextThreshold = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, progress: Math.min((current / needed) * 100, 100) };
}
