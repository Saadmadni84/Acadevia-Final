import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  GeneratedQuestion,
  VedicGameMode,
  VedicTopicId,
  DifficultyLevel,
  VedicGradeBand,
} from './types';
import { generateVedicQuestion } from './questionGenerator';
import { VedicKeypad } from './VedicKeypad';

interface PlayArenaProps {
  mode: VedicGameMode;
  initialTopicId?: VedicTopicId;
  initialDifficulty?: DifficultyLevel;
  gradeBand: VedicGradeBand;
  onExit: () => void;
  onComplete: (summary: {
    score: number;
    accuracy: number;
    avgTime: number;
    bestStreak: number;
    solvedCount: number;
    earnedXP: number;
    topicId?: VedicTopicId;
  }) => void;
}

export const PlayArena: React.FC<PlayArenaProps> = ({
  mode,
  initialTopicId = 'mult-11',
  initialDifficulty = 'medium',
  gradeBand,
  onExit,
  onComplete,
}) => {
  // Game Session States
  const [topicId, setTopicId] = useState<VedicTopicId>(initialTopicId);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion>(() =>
    generateVedicQuestion(initialTopicId, initialDifficulty, gradeBand)
  );
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Mode Specific States
  const [lives, setLives] = useState<number>(mode === 'streak' ? 3 : 0);
  const [timeLeft, setTimeLeft] = useState<number>(
    mode === 'time-attack' ? 60 : mode === 'daily' ? 180 : 0
  );
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [solveTimes, setSolveTimes] = useState<number[]>([]);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<{
    status: 'correct' | 'wrong';
    shortcut: string;
    explanation: string;
    xpGained?: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestion]);

  // Timer loop for Time Attack and Daily Math
  useEffect(() => {
    if (mode !== 'time-attack' && mode !== 'daily') return;
    if (timeLeft <= 0) {
      handleFinishSession();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, mode]);

  const handleFinishSession = useCallback(() => {
    const totalAttempts = solvedCount + mistakesCount;
    const accuracy =
      totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 100;
    const avgTime =
      solveTimes.length > 0
        ? Number(
            (
              solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length
            ).toFixed(1)
          )
        : 0;

    onComplete({
      score,
      accuracy,
      avgTime,
      bestStreak: Math.max(bestStreak, streak),
      solvedCount,
      earnedXP,
      topicId,
    });
  }, [
    solvedCount,
    mistakesCount,
    solveTimes,
    onComplete,
    score,
    bestStreak,
    streak,
    earnedXP,
    topicId,
  ]);

  // Next question generator with adaptive difficulty
  const nextQuestion = (nextStreakCount: number) => {
    let nextDiff = difficulty;
    if (mode === 'streak') {
      if (nextStreakCount >= 21) nextDiff = 'expert';
      else if (nextStreakCount >= 11) nextDiff = 'hard';
      else if (nextStreakCount >= 6) nextDiff = 'medium';
      else nextDiff = 'easy';
      setDifficulty(nextDiff);
    }
    const nextQ = generateVedicQuestion(topicId, nextDiff, gradeBand);
    setCurrentQuestion(nextQ);
    setInputAnswer('');
    setHintLevel(0);
    setQuestionStartTime(Date.now());
    setIsAnsweringLocked(false);
  };

  const handleCheckAnswer = () => {
    if (isAnsweringLocked || !inputAnswer.trim()) return;

    const timeSpentSec = Math.max(0.5, (Date.now() - questionStartTime) / 1000);
    const isCorrect = inputAnswer.trim() === currentQuestion.answer.trim();
    setIsAnsweringLocked(true);

    if (isCorrect) {
      const speedBonus =
        timeSpentSec < currentQuestion.targetSeconds ? 10 : 0;
      const streakBonus = Math.min(25, streak * 5);
      const hintPenalty = hintLevel * 4;
      const basePoints = 20;
      const xpGain = Math.max(5, basePoints + speedBonus + streakBonus - hintPenalty);

      setScore((s) => s + xpGain * 10);
      setEarnedXP((xp) => xp + xpGain);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setSolvedCount((c) => c + 1);
      setSolveTimes((prev) => [...prev, timeSpentSec]);

      setLastFeedback({
        status: 'correct',
        shortcut: currentQuestion.shortShortcut,
        explanation: currentQuestion.explanation,
        xpGained: xpGain,
      });

      // Quick auto-advance on correct answer (or allow student to inspect)
      setTimeout(() => {
        setLastFeedback(null);
        nextQuestion(newStreak);
      }, 1100);
    } else {
      setMistakesCount((m) => m + 1);
      setStreak(0);
      setLastFeedback({
        status: 'wrong',
        shortcut: `Correct Answer: ${currentQuestion.answer}`,
        explanation: currentQuestion.explanation,
      });

      if (mode === 'streak') {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setTimeout(() => handleFinishSession(), 1600);
          return;
        }
      }
    }
  };

  const multiplier =
    streak >= 20 ? 5 : streak >= 12 ? 4 : streak >= 7 ? 3 : streak >= 3 ? 2 : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-4 select-none">
      {/* Sticky Top HUD */}
      <div className="sticky top-2 z-40 rounded-3xl border-2 border-amber-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Title & Topic */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shadow-md">
            {mode === 'streak'
              ? '🔥'
              : mode === 'time-attack'
              ? '⚡'
              : mode === 'challenge'
              ? '🏆'
              : '🎯'}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
              {mode.toUpperCase().replace('-', ' ')}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
              {currentQuestion.topicName}
            </span>
          </div>
        </div>

        {/* Center: Live Stats */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-black">
          {/* Timer if applicable */}
          {(mode === 'time-attack' || mode === 'daily') && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${
                timeLeft <= 10
                  ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Timer className="h-4 w-4 text-amber-500" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {/* Lives if streak mode */}
          {mode === 'streak' && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < lives ? 'opacity-100' : 'opacity-20 grayscale'}`}
                >
                  ❤️
                </span>
              ))}
            </div>
          )}

          {/* Multiplier / Streak */}
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl ${
              multiplier > 1
                ? 'bg-amber-500 text-white shadow-xs animate-bounce'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>{multiplier}x Combo ({streak})</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>{score} PTS</span>
          </div>
        </div>

        {/* Right Controls: Sound & Exit Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-500 transition cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="rounded-2xl border-2 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-extrabold text-xs cursor-pointer hover:bg-rose-50"
          >
            Exit Game
          </Button>
        </div>
      </div>

      {/* Main Question Display Arena */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border-2 border-amber-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden"
      >
        {/* Subtle Decorative Backdrop */}
        <div className="absolute top-0 right-0 p-8 text-8xl font-serif text-amber-500/5 select-none pointer-events-none">
          ॐ
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Mental Math Challenge · {difficulty.toUpperCase()}
          </span>
          <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider text-gray-900 dark:text-white py-2">
            {currentQuestion.question}
          </div>
        </div>

        {/* User Answer Input Box */}
        <div className="flex items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCheckAnswer();
            }}
            placeholder="?"
            disabled={isAnsweringLocked}
            className="w-48 sm:w-64 h-14 sm:h-16 text-center text-3xl sm:text-4xl font-mono font-black rounded-2xl bg-amber-50/60 dark:bg-slate-800 border-3 border-amber-400 dark:border-amber-500 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-300/40 shadow-inner"
          />
        </div>

        {/* Progressive Hint Drawer */}
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={hintLevel >= currentQuestion.hints.length}
              onClick={() => setHintLevel((h) => h + 1)}
              className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 cursor-pointer disabled:opacity-40"
            >
              <HelpCircle className="h-4 w-4" />
              <span>
                {hintLevel === 0
                  ? 'Need a Hint?'
                  : `Show Next Hint (${hintLevel}/${currentQuestion.hints.length})`}
              </span>
            </button>
            {hintLevel > 0 && (
              <span className="text-slate-400 text-[11px]">
                -4 XP per hint used
              </span>
            )}
          </div>

          <AnimatePresence>
            {hintLevel > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold text-amber-900 dark:text-amber-200 text-left space-y-1"
              >
                {currentQuestion.hints.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="font-black text-amber-600">
                      Hint {i + 1}:
                    </span>
                    <span>{h}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feedback Alert on Submit */}
        <AnimatePresence>
          {lastFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl text-left border-2 flex items-start gap-3 ${
                lastFeedback.status === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200'
              }`}
            >
              {lastFeedback.status === 'correct' ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">
                    {lastFeedback.status === 'correct'
                      ? '✓ CORRECT! Mental Shortcut Applied'
                      : 'Not quite! Here is the shortcut:'}
                  </span>
                  {lastFeedback.xpGained && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100">
                      +{lastFeedback.xpGained} XP
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono font-bold">
                  {lastFeedback.shortcut}
                </p>
                <p className="text-xs opacity-90">{lastFeedback.explanation}</p>
                {lastFeedback.status === 'wrong' && (
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => {
                      setLastFeedback(null);
                      nextQuestion(0);
                    }}
                    className="mt-2 text-xs font-bold px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Responsive Mobile / Touch Keypad */}
        <div className="pt-2">
          <VedicKeypad
            value={inputAnswer}
            onChange={setInputAnswer}
            onSubmit={handleCheckAnswer}
            disabled={isAnsweringLocked}
            allowSlash={currentQuestion.topicId === 'fractions'}
          />
        </div>
      </motion.div>
    </div>
  );
};
