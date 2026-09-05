export type VedicGradeBand = '5-6' | '7-8' | '9-10' | '11-12';

export type VedicGameMode = 'dashboard' | 'learn' | 'practice' | 'time-attack' | 'streak' | 'challenge' | 'daily';

export type VedicTopicId =
  | 'mult-11'
  | 'mult-5'
  | 'mult-25'
  | 'mult-50'
  | 'near-100'
  | 'square-ending-5'
  | 'square-near-base'
  | 'fast-addition'
  | 'fast-subtraction'
  | 'percentages'
  | 'square-roots'
  | 'cube-roots'
  | 'fractions'
  | 'mixed-speed';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface VedicTechniqueStep {
  title: string;
  detail: string;
  mathVisual: string;
  highlight?: string;
}

export interface VedicTechnique {
  id: VedicTopicId;
  name: string;
  sanskritName: string;
  shortDesc: string;
  fullDesc: string;
  whenToUse: string;
  gradeBand: VedicGradeBand[];
  steps: VedicTechniqueStep[];
  workedExample: {
    problem: string;
    answer: string;
    stepByStep: string[];
    visualBreakdown: string;
  };
  sampleQuestions: {
    question: string;
    answer: string;
    steps: string;
  }[];
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  answer: string;
  topicId: VedicTopicId;
  topicName: string;
  difficulty: DifficultyLevel;
  hints: string[];
  explanation: string;
  shortShortcut: string;
  mathExpression?: string;
  targetSeconds: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserProgressState {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  totalXP: number;
  level: number;
  bestStreak: number;
  currentStreak: number;
  bestTimeAttackScore: number;
  dailyStreak: number;
  lastDailyDate: string;
  mastery: Record<VedicTopicId, 'not_started' | 'learning' | 'practicing' | 'good' | 'mastered'>;
  achievements: Record<string, boolean>;
  solveTimes: number[];
}

export interface ChallengeMission {
  id: string;
  title: string;
  desc: string;
  topicId: VedicTopicId;
  targetCount: number;
  timeLimitSec: number;
  rewardXP: number;
  minGradeBand: VedicGradeBand;
  badgeName: string;
  badgeIcon: string;
}
