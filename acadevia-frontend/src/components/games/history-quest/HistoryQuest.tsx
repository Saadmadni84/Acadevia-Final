import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Star,
  Trophy,
  Award,
  BookOpen,
  Lock,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import { ANCIENT_CHAPTERS } from './ancientIndiaData';
import type { HistoryClassGrade, AncientChapterId } from './types';
import { KingsRoadGame } from './chapters/KingsRoadGame';
import { TravellersPathGame } from './chapters/TravellersPathGame';
import { NeolithicDiscoveryGame } from './chapters/NeolithicDiscoveryGame';
import { cn } from '@/lib/utils';

type QuestState = 'intro' | 'chapter-hub' | 'playing' | 'completed';

export const HistoryQuest: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const studentId = user?.id || 'guest_student';
  const studentName = user?.fullName || 'Young Historian';

  // Grade detection (default to Class 6)
  const detectedGrade: HistoryClassGrade = useMemo(() => {
    if (user?.className) {
      const match = user.className.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (parsed >= 6 && parsed <= 10) return parsed as HistoryClassGrade;
      }
    }
    return 6;
  }, [user]);

  const [selectedGrade, setSelectedGrade] = useState<HistoryClassGrade>(detectedGrade);
  const [questState, setQuestState] = useState<QuestState>('intro');
  const [activeChapterId, setActiveChapterId] = useState<AncientChapterId>('chapter1');
  const [unlockedChapters, setUnlockedChapters] = useState<AncientChapterId[]>(['chapter1']);
  const [completedChapters, setCompletedChapters] = useState<AncientChapterId[]>([]);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const sessionStorageKey = `acadevia_history_quest_session_${studentId}`;

  // Session persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionStorageKey);
      if (!saved) return;
      const session = JSON.parse(saved);
      if (session.unlockedChapters) setUnlockedChapters(session.unlockedChapters);
      if (session.completedChapters) setCompletedChapters(session.completedChapters);
      if (session.activeChapterId) setActiveChapterId(session.activeChapterId);
      if (session.score) setScore(session.score);
      if (session.earnedXP) setEarnedXP(session.earnedXP);
      if (session.totalStars) setTotalStars(session.totalStars);
    } catch {
      localStorage.removeItem(sessionStorageKey);
    }
  }, [sessionStorageKey]);

  useEffect(() => {
    if (questState === 'intro') return;
    const session = {
      grade: selectedGrade,
      unlockedChapters,
      completedChapters,
      activeChapterId,
      score,
      earnedXP,
      totalStars,
    };
    try {
      localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } catch {
      /* ignore storage */
    }
  }, [activeChapterId, completedChapters, earnedXP, questState, score, selectedGrade, sessionStorageKey, totalStars, unlockedChapters]);

  const handleStartChapter = (chId: AncientChapterId) => {
    if (!unlockedChapters.includes(chId)) return;
    setActiveChapterId(chId);
    setQuestState('playing');
  };

  const handleChapterComplete = async () => {
    const xpPerChapter = 50;
    const scorePerChapter = 35;
    const newXP = earnedXP + xpPerChapter;
    const newScore = score + scorePerChapter;
    const newStars = totalStars + 1;

    setEarnedXP(newXP);
    setScore(newScore);
    setTotalStars(newStars);

    const nextCompleted = Array.from(new Set([...completedChapters, activeChapterId]));
    setCompletedChapters(nextCompleted);

    // Unlock next chapter
    const chapterOrder: AncientChapterId[] = ['chapter1', 'chapter2', 'chapter3'];
    const currentIndex = chapterOrder.indexOf(activeChapterId);

    if (currentIndex < chapterOrder.length - 1) {
      const nextChapterId = chapterOrder[currentIndex + 1];
      const nextUnlocked = Array.from(new Set([...unlockedChapters, nextChapterId]));
      setUnlockedChapters(nextUnlocked);
      setQuestState('chapter-hub');
    } else {
      // Completed all chapters
      setQuestState('completed');
      try {
        await gameService.submitScore('history-quest', {
          score: newScore,
          timeTaken: 240,
        });
      } catch {
        /* fallback */
      }
    }
  };

  // ==========================================
  // 1. INTRO / CLASS SELECTION SCREEN
  // ==========================================
  if (questState === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-2 sm:p-4 select-none">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTES.GAMES)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </button>
        </div>

        {/* Hero Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 text-xs font-bold uppercase tracking-wider">
                🏺 History Quest · Interactive Historical Adventure
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                The Chronicles of Ancient India
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg">
                Welcome {studentName}! Step back thousands of years to guide Chandragupta Maurya to Magadha, accompany Xuanzang on his pilgrimage, and excavate prehistoric Neolithic settlements across the subcontinent!
              </p>

              {/* Class Grade Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Select Your Grade:
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {[6, 7, 8, 9, 10].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade as HistoryClassGrade)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer',
                        selectedGrade === grade
                          ? 'border-orange-500 bg-orange-500 text-white shadow-xs scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-400'
                      )}
                    >
                      Class {grade} {grade === 6 ? '· Ancient India' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => setQuestState('chapter-hub')}
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  className="shadow-md text-base px-8 py-3.5 cursor-pointer bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
                >
                  ENTER ANCIENT INDIA
                </Button>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Award className="h-4 w-4 text-orange-500" />
                  <span>3 Interactive Chapters · +150 XP Reward</span>
                </div>
              </div>
            </div>

            {/* Right Explorer Badge */}
            <div className="w-full md:w-64 bg-[#FFFBEB] dark:bg-gray-800/70 rounded-3xl p-6 border border-amber-200/80 dark:border-gray-700 text-center space-y-3 shrink-0">
              <div className="text-5xl">🏛️</div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {studentName}
              </h3>
              <p className="text-xs text-gray-500">
                Class {selectedGrade} Historian
              </p>
              <div className="pt-3 border-t border-amber-200 dark:border-gray-700 text-xs font-bold text-orange-600 flex items-center justify-center gap-1">
                <span>Mauryan Era</span>
                <span>·</span>
                <span>Harsha</span>
                <span>·</span>
                <span>Neolithic</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // 2. CHAPTER HUB / CAMPAIGN MAP
  // ==========================================
  if (questState === 'chapter-hub') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-2 sm:p-4 select-none">
        {/* Top Breadcrumb & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setQuestState('intro')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary cursor-pointer"
          >
            <span>← Change Grade</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span>{totalStars} Stars Earned</span>
            </div>
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{earnedXP} XP</span>
            </div>
          </div>
        </div>

        {/* Campaign Header */}
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="text-4xl sm:text-5xl animate-bounce">🏺</div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                The Chronicles of Ancient India
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                Class 6 Historical Campaign · Complete each chapter to unlock the next era!
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-card-dark border border-amber-200 text-xs font-extrabold text-amber-800 dark:text-amber-200 shadow-2xs">
            {completedChapters.length} / 3 Chapters Mastered
          </div>
        </div>

        {/* 3 Connected Chapter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ANCIENT_CHAPTERS.map((ch, idx) => {
            const isUnlocked = unlockedChapters.includes(ch.id);
            const isCompleted = completedChapters.includes(ch.id);

            return (
              <motion.div
                key={ch.id}
                whileHover={isUnlocked ? { y: -4 } : {}}
                className={cn(
                  'rounded-3xl border-2 p-6 flex flex-col justify-between transition-all relative overflow-hidden',
                  isCompleted
                    ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isUnlocked
                    ? 'border-orange-400 bg-white dark:bg-card-dark shadow-md'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60'
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{ch.avatar}</span>
                    <div>
                      {isCompleted ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Mastered ✓
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                          Ready to Play
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mt-4">
                    Chapter {idx + 1} · {ch.era}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                    {ch.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-3">
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                    📍 <strong>Focus:</strong> {ch.location}
                  </div>

                  <Button
                    variant={isCompleted ? 'outline' : 'gradient'}
                    size="sm"
                    disabled={!isUnlocked}
                    onClick={() => handleStartChapter(ch.id)}
                    className="w-full font-bold cursor-pointer shadow-xs"
                  >
                    {isCompleted ? 'Replay Chapter ↺' : isUnlocked ? 'Play Chapter →' : 'Complete Previous Chapter'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. PLAYING DEDICATED CHAPTER MINI-GAME
  // ==========================================
  if (questState === 'playing') {
    return (
      <div className="max-w-5xl mx-auto space-y-5 p-2 select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setQuestState('chapter-hub')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
          >
            <span>← Back to Campaign Map</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Class 6 Ancient India
            </span>
          </div>
        </div>

        {/* Dedicated Chapter Mini-Game Component */}
        {activeChapterId === 'chapter1' && (
          <KingsRoadGame onComplete={handleChapterComplete} />
        )}
        {activeChapterId === 'chapter2' && (
          <TravellersPathGame onComplete={handleChapterComplete} />
        )}
        {activeChapterId === 'chapter3' && (
          <NeolithicDiscoveryGame onComplete={handleChapterComplete} />
        )}
      </div>
    );
  }

  // ==========================================
  // 4. VICTORY / CAMPAIGN COMPLETION
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-amber-200/80 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-lg text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-white mx-auto flex items-center justify-center text-4xl shadow-md">
          🏆
        </div>

        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Campaign Mastered!
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Ancient India Master Explorer
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            Congratulations {studentName}! You navigated Chandragupta to Magadha, guided Xuanzang to King Harsha, and excavated the 4 Neolithic settlements!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-100">
            <span className="text-xs text-gray-400 block font-medium">Total Score</span>
            <span className="text-xl font-extrabold text-orange-600">{score}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-xs text-gray-400 block font-medium">Stars</span>
            <span className="text-xl font-extrabold text-amber-600">{totalStars} ⭐</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-xs text-gray-400 block font-medium">XP Reward</span>
            <span className="text-xl font-extrabold text-emerald-600">+150 XP</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.GAMES)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:flex-1 cursor-pointer"
          >
            BACK TO GAMES
          </Button>
          <Button
            variant="gradient"
            onClick={() => {
              setQuestState('chapter-hub');
            }}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="w-full sm:flex-1 shadow-md cursor-pointer"
          >
            REPLAY CHAPTERS
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
