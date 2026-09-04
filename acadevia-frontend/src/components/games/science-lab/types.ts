export type ScienceClassGrade = 6 | 7 | 8;

export type ScienceGameId =
  | 'magnet-rescue'
  | 'water-world'
  | 'separation-factory'
  | 'measure-move'
  | 'life-explorer'
  | 'science-detective'
  | 'food-lab-rescue'
  | 'space-mission';

export interface ScienceGameMeta {
  id: ScienceGameId;
  title: string;
  curriculumChapter: string;
  description: string;
  gameType: string;
  avatar: string;
  badge: string;
  colors: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  estimatedTime: string;
  xpReward: number;
  learningOutcomes: string[];
}
