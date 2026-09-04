export type HistoryClassGrade = 6 | 7 | 8 | 9 | 10;

export type AncientChapterId = 'chapter1' | 'chapter2' | 'chapter3';

export interface AncientChapter {
  id: AncientChapterId;
  index: number;
  title: string;
  subtitle: string;
  heroCharacter: string;
  heroRole: string;
  avatar: string;
  icon: string;
  description: string;
  location: string;
  era: string;
  xpReward: number;
  learningOutcome: string;
}

export interface ArchaeologySite {
  id: 'burzahom' | 'mehrgarh' | 'paiyampalli' | 'chirand';
  name: string;
  region: string;
  state: string;
  position: { x: number; y: number }; // percentage on map
  artefactName: string;
  artefactIcon: string;
  historicalSignificance: string;
  excavationDepth: number; // brush clicks needed
  discovered: boolean;
}

export interface HistoryQuestSession {
  grade: HistoryClassGrade;
  unlockedChapters: AncientChapterId[];
  completedChapters: AncientChapterId[];
  activeChapterId: AncientChapterId;
  score: number;
  earnedXP: number;
  stars: number;
}
