import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Layers,
  GraduationCap,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { aiQuizService } from '@/services/aiQuiz.service';
import type { NcertChapterItem } from '@/types/aiQuiz.types';
import type { QuizRecord } from '@/services/data.service';

interface AiNcertQuizGeneratorProps {
  onQuizGenerated: (quiz: QuizRecord) => void;
  defaultClassGrade?: number;
}

export const AiNcertQuizGenerator: React.FC<AiNcertQuizGeneratorProps> = ({
  onQuizGenerated,
  defaultClassGrade = 9,
}) => {
  // Available validated classes & subjects (strictly verified NCERT dataset)
  const availableClasses = [9];
  const availableSubjects = ['Mathematics'];

  const [selectedClass, setSelectedClass] = useState<number>(defaultClassGrade === 9 ? 9 : 9);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [chapters, setChapters] = useState<NcertChapterItem[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'MCQ'>('MCQ');
  const [questionCount, setQuestionCount] = useState<number>(1);

  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load available chapters dynamically from the backend
  useEffect(() => {
    let isMounted = true;
    const loadChapters = async () => {
      setIsLoadingChapters(true);
      setErrorMessage(null);
      try {
        const res = await aiQuizService.getAvailableChapters(selectedClass, selectedSubject);
        if (isMounted && res && Array.isArray(res.chapters)) {
          setChapters(res.chapters);
          if (res.chapters.length > 0) {
            setSelectedChapter(res.chapters[0].name);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[AiNcertQuizGenerator] Could not load chapters:', err.message);
          setChapters([]);
          setSelectedChapter('');
          setErrorMessage('Could not load NCERT chapters. Please verify backend connection.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingChapters(false);
        }
      }
    };

    loadChapters();
    return () => {
      isMounted = false;
    };
  }, [selectedClass, selectedSubject]);

  const handleGenerate = async () => {
    if (!selectedChapter) return;
    setIsGenerating(true);
    setErrorMessage(null);

    // Staged feedback messages
    setGenerationStep('Retrieving NCERT textbook chunks...');
    const stepTimer1 = setTimeout(() => {
      setGenerationStep('Grounding questions with syllabus concepts...');
    }, 1800);
    const stepTimer2 = setTimeout(() => {
      setGenerationStep('Validating CBSE-compliant options & marking scheme...');
    }, 4500);

    try {
      const generatedQuiz = await aiQuizService.generateAiQuiz({
        classGrade: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        difficulty,
        questionType,
        count: questionCount,
      });

      if (!generatedQuiz || !generatedQuiz.questions || generatedQuiz.questions.length === 0) {
        throw new Error('Received empty question set from NCERT generator');
      }

      // Immediately pass to parent to open existing QuizPlayer
      onQuizGenerated(generatedQuiz);
    } catch (err: any) {
      console.error('[AiNcertQuizGenerator] Generation error:', err);
      const isQuota =
        err.message?.includes('429') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.response?.status === 429;

      if (isQuota) {
        setErrorMessage('Daily NCERT AI generation limit reached. Please try again later.');
      } else {
        setErrorMessage(
          err.response?.data?.error ||
            err.message ||
            'AI quiz generation is temporarily unavailable. Please try again.'
        );
      }
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-white via-[#F8F9FE] to-primary/5 dark:from-card-dark dark:via-[#1E1B2E] dark:to-primary/10 p-5 sm:p-6 shadow-md transition-all">
      {/* Header with Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                AI NCERT Quiz Generator
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <CheckCircle2 className="h-3 w-3" />
                NCERT Grounded
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Generate personalized assessments retrieved directly from indexed NCERT textbooks.
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500 self-start sm:self-auto font-mono bg-white/60 dark:bg-black/20 px-2.5 py-1 rounded-md border border-gray-100 dark:border-gray-800">
          Curriculum: Class 9 Math (Ch 1–3)
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
        {/* 1. Class */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-60 cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 2. Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Subject
          </label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isGenerating}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-60 cursor-pointer"
            >
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 3. Chapter (Dynamically loaded) */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-primary" />
            NCERT Chapter
          </label>
          <div className="relative">
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={isGenerating || isLoadingChapters}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-60 cursor-pointer truncate"
            >
              {isLoadingChapters ? (
                <option value="">Loading chapters...</option>
              ) : (
                chapters.map((ch) => (
                  <option key={ch.id} value={ch.name}>
                    Chapter {ch.chapter}: {ch.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 4. Difficulty */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Difficulty
          </label>
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              disabled={isGenerating}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-60 cursor-pointer"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 5. Question Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            Question Type
          </label>
          <div className="relative">
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as any)}
              disabled={isGenerating}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-60 cursor-pointer"
            >
              <option value="MCQ">Multiple Choice (MCQ)</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 6. Question Count */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Number of Questions
          </label>
          <div className="relative">
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-60 cursor-pointer"
            >
              <option value={1}>1 Question (Recommended)</option>
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-4 p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          {isGenerating ? (
            <span className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {generationStep || 'Generating your NCERT quiz...'}
            </span>
          ) : (
            <span>Ready to generate verified CBSE-pattern questions.</span>
          )}
        </div>

        <Button
          type="button"
          variant="gradient"
          onClick={handleGenerate}
          disabled={isGenerating || isLoadingChapters || !selectedChapter}
          className="w-full sm:w-auto px-6 h-11 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Quiz...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              ⚡ Generate AI Quiz with NCERT
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
