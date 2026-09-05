export type RunnerLane = 0 | 1 | 2; // Left (0), Center (1), Right (2)

export type GameState =
  | 'menu'
  | 'running'
  | 'paused'
  | 'boss'
  | 'gameover'
  | 'dojo'
  | 'shop'
  | 'leaderboard';

export type ZoneId =
  | 'number-village'
  | 'mult-forest'
  | 'square-mountain'
  | 'root-valley'
  | 'vedic-temple'
  | 'infinity-arena';

export interface ZoneConfig {
  id: ZoneId;
  name: string;
  themeColor: string;
  skyGradient: string;
  groundColor: string;
  obstacleTypes: MathChallengeType[];
  minDistance: number;
}

export type MathChallengeType =
  | 'mult-gate'
  | 'square-crystal'
  | 'root-bridge'
  | 'cube-tower'
  | 'near100-lock'
  | 'speed-sutra'
  | 'jump-barrier'
  | 'slide-laser';

export interface MathChallengeGate {
  id: string;
  z: number; // distance down the track in front of runner (0 to 1000)
  type: MathChallengeType;
  prompt: string;
  formulaHint: string;
  techniqueName: string;
  lanes: [
    { value: string | number; isCorrect: boolean },
    { value: string | number; isCorrect: boolean },
    { value: string | number; isCorrect: boolean }
  ];
  passed?: boolean;
}

export interface CollectibleCoin {
  id: string;
  z: number;
  lane: RunnerLane;
  collected?: boolean;
}

export interface ActivePowerup {
  type: 'speed' | 'multiplier' | 'shield' | 'slowmo' | 'magnet';
  durationSec: number;
  remainingSec: number;
}

export interface PlayerStats {
  coins: number;
  totalDistance: number;
  highestScore: number;
  bestCombo: number;
  calculationsMastered: number;
  level: number;
  xp: number;
  unlockedSkins: string[];
  selectedSkin: string;
  upgrades: {
    magnetDuration: number;
    shieldCount: number;
    comboBoost: number;
  };
}

export interface BossState {
  name: string;
  title: string;
  maxHealth: number;
  currentHealth: number;
  attackTimer: number;
  currentAttack: {
    prompt: string;
    technique: string;
    options: { value: string | number; isCorrect: boolean; lane: RunnerLane }[];
  } | null;
}
