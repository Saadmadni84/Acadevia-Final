import type { UserProgressState, VedicTopicId } from './types';

const STORAGE_KEY = 'acadevia_vedic_math_progress_v1';

export const INITIAL_PROGRESS: UserProgressState = {
  totalQuestions: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  accuracy: 100,
  totalXP: 0,
  level: 1,
  bestStreak: 0,
  currentStreak: 0,
  bestTimeAttackScore: 0,
  dailyStreak: 0,
  lastDailyDate: '',
  mastery: {
    'mult-11': 'not_started',
    'mult-5': 'not_started',
    'mult-25': 'not_started',
    'mult-50': 'not_started',
    'near-100': 'not_started',
    'square-ending-5': 'not_started',
    'square-near-base': 'not_started',
    'fast-addition': 'not_started',
    'fast-subtraction': 'not_started',
    'percentages': 'not_started',
    'square-roots': 'not_started',
    'cube-roots': 'not_started',
    'fractions': 'not_started',
    'mixed-speed': 'not_started',
  },
  achievements: {},
  solveTimes: [],
};

export function loadVedicProgress(): UserProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_PROGRESS, ...parsed };
  } catch {
    return INITIAL_PROGRESS;
  }
}

export function saveVedicProgress(progress: UserProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save vedic progress:', e);
  }
}

export function calculateLevel(xp: number): number {
  // 100 XP per level, with quadratic scaling
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function updateMasteryStatus(
  current: UserProgressState['mastery'][VedicTopicId],
  isCorrect: boolean
): UserProgressState['mastery'][VedicTopicId] {
  if (isCorrect) {
    if (current === 'not_started') return 'learning';
    if (current === 'learning') return 'practicing';
    if (current === 'practicing') return 'good';
    if (current === 'good') return 'mastered';
    return 'mastered';
  }
  return current === 'mastered' ? 'good' : current;
}
