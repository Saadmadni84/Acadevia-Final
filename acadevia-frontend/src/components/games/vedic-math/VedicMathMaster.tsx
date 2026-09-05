import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import type {
  VedicGameMode,
  VedicGradeBand,
  VedicTopicId,
  DifficultyLevel,
  UserProgressState,
} from './types';
import {
  loadVedicProgress,
  saveVedicProgress,
  calculateLevel,
  updateMasteryStatus,
} from './progressStorage';
import { DashboardView } from './DashboardView';
import { LearnModeView } from './LearnModeView';
import { PlayArena } from './PlayArena';
import { ResultSummary } from './ResultSummary';
import { VedicMathRushGame } from './VedicMathRushGame';

export const VedicMathMaster: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Grade Band selection (Classes 5-6, 7-8, 9-10, 11-12)
  const defaultGrade = useMemo<VedicGradeBand>(() => {
    if (user?.classGrade) {
      const g = user.classGrade;
      if (g <= 6) return '5-6';
      if (g <= 8) return '7-8';
      if (g <= 10) return '9-10';
      return '11-12';
    }
    return '7-8';
  }, [user]);

  const [gradeBand, setGradeBand] = useState<VedicGradeBand>(defaultGrade);
  const [gameMode, setGameMode] = useState<VedicGameMode>('dashboard');
  const [activeTopicId, setActiveTopicId] = useState<VedicTopicId>('mult-11');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>('medium');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [progress, setProgress] = useState<UserProgressState>(() => loadVedicProgress());

  // Result summary storage after round completes
  const [lastRoundResult, setLastRoundResult] = useState<{
    score: number;
    accuracy: number;
    avgTime: number;
    bestStreak: number;
    solvedCount: number;
    earnedXP: number;
  } | null>(null);

  // Save progress locally on changes
  useEffect(() => {
    saveVedicProgress(progress);
  }, [progress]);

  const handleRecordXP = useCallback((xpGain: number) => {
    setProgress((prev) => {
      const nextXP = prev.totalXP + xpGain;
      const nextLvl = calculateLevel(nextXP);
      return {
        ...prev,
        totalXP: nextXP,
        level: nextLvl,
      };
    });
  }, []);

  const handleStartMode = (
    mode: VedicGameMode,
    opts?: { topicId?: VedicTopicId; difficulty?: DifficultyLevel }
  ) => {
    if (opts?.topicId) setActiveTopicId(opts.topicId);
    if (opts?.difficulty) setActiveDifficulty(opts.difficulty);
    setLastRoundResult(null);
    setGameMode(mode);
  };

  const handleRoundComplete = (summary: {
    score: number;
    accuracy: number;
    avgTime: number;
    bestStreak: number;
    solvedCount: number;
    earnedXP: number;
    topicId?: VedicTopicId;
  }) => {
    setProgress((prev) => {
      const nextXP = prev.totalXP + summary.earnedXP;
      const nextLvl = calculateLevel(nextXP);
      const nextSolved = prev.totalQuestions + summary.solvedCount;
      const nextCorrect = prev.correctAnswers + summary.solvedCount;
      const nextAccuracy =
        nextSolved > 0 ? Math.round((nextCorrect / nextSolved) * 100) : 100;
      const nextBestStreak = Math.max(prev.bestStreak, summary.bestStreak);

      const nextMastery = { ...prev.mastery };
      if (summary.topicId) {
        nextMastery[summary.topicId] = updateMasteryStatus(
          nextMastery[summary.topicId],
          summary.accuracy >= 75
        );
      }

      return {
        ...prev,
        totalQuestions: nextSolved,
        correctAnswers: nextCorrect,
        accuracy: nextAccuracy,
        totalXP: nextXP,
        level: nextLvl,
        bestStreak: nextBestStreak,
        mastery: nextMastery,
      };
    });

    setLastRoundResult(summary);

    // Also submit score to Acadevia backend game service
    gameService
      .submitScore('vedic-math-master', {
        score: summary.score,
        timeTaken: Math.round(summary.avgTime * summary.solvedCount),
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-2 sm:p-4 md:p-6 select-none relative">
      {/* Top Level Navigation Bar */}
      <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (gameMode === 'dashboard') {
              navigate(ROUTES.GAMES);
            } else {
              setShowExitConfirm(true);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{gameMode === 'dashboard' ? 'Back to Games Hub' : 'Exit Round'}</span>
        </button>
      </div>

      {/* Screen Routing */}
      {gameMode === 'rush' ? (
        <VedicMathRushGame
          classGrade={user?.classGrade || 8}
          onExitGame={() => setGameMode('dashboard')}
          onSaveProgress={(s) => handleRecordXP(Math.floor(s.score / 10))}
        />
      ) : lastRoundResult ? (
        <ResultSummary
          score={lastRoundResult.score}
          accuracy={lastRoundResult.accuracy}
          avgTime={lastRoundResult.avgTime}
          bestStreak={lastRoundResult.bestStreak}
          solvedCount={lastRoundResult.solvedCount}
          earnedXP={lastRoundResult.earnedXP}
          onPlayAgain={() => setLastRoundResult(null)}
          onBackToDashboard={() => {
            setLastRoundResult(null);
            setGameMode('dashboard');
          }}
        />
      ) : gameMode === 'dashboard' ? (
        <div className="space-y-6">
          {/* Main Play Arcade Runner Banner */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-black/20 text-xs font-black uppercase tracking-widest">
                🔥 3D Arcade Runner Mode
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">
                Vedic Math Rush
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 max-w-md">
                Run through mathematical gates, leap across square crystals, dodge obstacle lasers, and survive the Vedic Temple!
              </p>
            </div>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setGameMode('rush' as any)}
              className="px-8 py-4 rounded-2xl bg-white text-orange-700 font-black text-base shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <span>PLAY RUSH RUNNER 🏃‍♂️💨</span>
            </Button>
          </div>

          <DashboardView
            progress={progress}
            gradeBand={gradeBand}
            onSelectGradeBand={setGradeBand}
            onStartMode={handleStartMode}
          />
        </div>
      ) : gameMode === 'learn' ? (
        <LearnModeView
          gradeBand={gradeBand}
          onBack={() => setGameMode('dashboard')}
          onStartPractice={(tId) =>
            handleStartMode('practice', { topicId: tId, difficulty: 'medium' })
          }
          onRecordXP={handleRecordXP}
        />
      ) : (
        <PlayArena
          mode={gameMode}
          initialTopicId={activeTopicId}
          initialDifficulty={activeDifficulty}
          gradeBand={gradeBand}
          onExit={() => setShowExitConfirm(true)}
          onComplete={handleRoundComplete}
        />
      )}

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-amber-300 dark:border-slate-700 shadow-2xl space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-3xl flex items-center justify-center mx-auto">
                ⚠️
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Exit this game?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your current active round will not be saved and no XP will be awarded for unfinished questions.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="gradient"
                  size="md"
                  onClick={() => setShowExitConfirm(false)}
                  className="font-bold shadow-md cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  Continue Playing
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setShowExitConfirm(false);
                    setGameMode('dashboard');
                  }}
                  className="font-bold border-2 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 cursor-pointer"
                >
                  Exit Game
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
