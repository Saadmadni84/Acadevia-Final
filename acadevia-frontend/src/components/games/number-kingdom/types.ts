export type MathTopic =
  | 'counting'
  | 'numberRecognition'
  | 'quantity'
  | 'moreLess'
  | 'addition'
  | 'subtraction'
  | 'shapes'
  | 'patterns'
  | 'money'
  | 'multiplication'
  | 'geometry'
  | 'multiStep';

export type StudentClassGrade = 1 | 2 | 3 | 4;

export type WorldId =
  | 'village'
  | 'forest'
  | 'railway'
  | 'tower'
  | 'bridge'
  | 'builder'
  | 'market'
  | 'garden'
  | 'dragon'
  | 'castle';

export type PetType = 'puppy' | 'kitty' | 'fox' | 'bunny';

export interface PetConfig {
  id: PetType;
  name: string;
  avatar: string;
  greeting: string;
}

export interface WorldDefinition {
  id: WorldId;
  index: number;
  name: string;
  subtitle: string;
  icon: string;
  topic: MathTopic;
  color: string;
  bgColor: string;
  description: string;
  requiredStarsToUnlock: number;
}

export interface InteractiveMission {
  id: string;
  worldId: WorldId;
  classGrade: StudentClassGrade;
  title: string;
  instruction: string;
  topic: MathTopic;
  prompt: string;
  mathExplanation: string;
  // Payload for interactive adventures
  payload: {
    // Village Star Hunt & Exploration
    targetHouseNumber?: number;
    houseNumbers?: number[];
    starsInArea?: number;
    
    // Train
    neededPassengers?: number;
    availablePassengers?: number;
    
    // Wizard Tower
    doorStars?: number[];
    targetDoorStars?: number;

    // More / Less Forest
    pathA?: { icon: string; count: number };
    pathB?: { icon: string; count: number };
    comparisonType?: 'MORE' | 'LESS' | 'SAME';

    // Bridge Addition
    haveQuantity?: number;
    neededTotal?: number;
    targetQuantity?: number;

    // Shape House
    targetShapes?: Array<{ id: string; name: string; icon: string; slot: 'roof' | 'body' | 'window' | 'door' }>;

    // Pattern Garden
    patternSequence?: string[];
    patternOptions?: string[];
    patternMissingIndex?: number;

    // General / Advanced payloads
    initialQuantity?: number;
    subtractedQuantity?: number;
    itemPrice?: number;
    customerPaid?: number;
    gridRows?: number;
    gridCols?: number;
    trainCarriages?: number;
    passengersPerCarriage?: number;
    sequence?: Array<number | null>;
    missingIndex?: number;
    missingOptions?: number[];
    correctAnswer: number | string;
  };
}

export interface MissionResult {
  missionId: string;
  worldId: WorldId;
  topic: MathTopic;
  isSuccess: boolean;
  timeSpentSec: number;
  starsEarned: number; // 1, 2, or 3
  xpEarned: number;
}

export interface NumberKingdomAnalyticsReport {
  studentId: string;
  gameId: 'number-kingdom';
  studentClass: StudentClassGrade;
  totalScore: number;
  totalStars: number;
  totalXpAwarded: number;
  completedWorlds: WorldId[];
  overallAccuracy: number;
  strongestTopic: string;
  needsPracticeTopic: string;
  topicPerformance: Record<MathTopic, { total: number; correct: number; accuracy: number }>;
  timestamp: string;
}
