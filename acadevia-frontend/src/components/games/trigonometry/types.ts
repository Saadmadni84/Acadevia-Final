export type TrigTopic =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'specialAngles'
  | 'unitCircle'
  | 'quadrants'
  | 'angleFinding';

export interface TrigQuestion {
  id: string;
  topic: TrigTopic;
  subTopic?: string;
  stage: number;
  question: string;
  equation?: string;
  angleDeg?: number;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface QuestionAttemptRecord {
  questionId: string;
  topic: TrigTopic;
  subTopic?: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTakenSec: number;
  stage: number;
}

export interface TopicPerformance {
  topic: TrigTopic;
  label: string;
  total: number;
  correct: number;
  accuracy: number; // 0 to 100
}

export interface TrigAnalyticsReport {
  studentId: string;
  gameId: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  xpAwarded: number;
  strongestTopic: string;
  needsPracticeTopic: string;
  topicBreakdown: Record<TrigTopic, { total: number; correct: number; accuracy: number }>;
  attemptsLog: QuestionAttemptRecord[];
}

export type GameStageId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StageConfig {
  id: GameStageId;
  name: string;
  title: string;
  description: string;
  icon: string;
  requiredQuestions: number;
}
