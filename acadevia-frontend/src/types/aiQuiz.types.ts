import type { QuizRecord } from '@/services/data.service';

export interface NcertChapterItem {
  id: number;
  chapter: number;
  name: string;
  sourceFile: string;
  chunkCount: number;
}

export interface NcertChaptersResponse {
  classGrade: number;
  subject: string;
  chapters: NcertChapterItem[];
}

export interface AiQuizGenerateParams {
  classGrade: number;
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'MCQ';
  count: number;
}

export type GeneratedQuizResponse = QuizRecord;
