import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Heart,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Zap,
  Award,
  ChevronRight,
  Compass,
  Swords,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import type {
  TrigQuestion,
  QuestionAttemptRecord,
  TrigTopic,
  TopicPerformance,
  TrigAnalyticsReport,
  GameStageId,
} from './types';
import { STAGE_CONFIGS, TRIG_QUESTIONS } from './trigQuestions';
import { UnitCircleSVG, type UnitCirclePoint } from './UnitCircleSVG';
import { cn } from '@/lib/utils';

type GameState = 'intro' | 'playing' | 'stage-cleared' | 'game-over' | 'completed';

export const TrigonometryQuest: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const studentId = user?.id || 'guest_student';
  const studentName = user?.fullName || 'Student';

  // Game Progress State
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentStageId, setCurrentStageId] = useState<GameStageId>(1);
  const [stageQuestionIndex, setStageQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean | null>(null);

  // Speed Round Timer (Stage 6)
  const [speedTimeLeft, setSpeedTimeLeft] = useState(30);
  const speedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Boss Battle State (Stage 7)
  const [bossHp, setBossHp] = useState(100);
  const [bossAnimation, setBossAnimation] = useState<'idle' | 'hit' | 'attack'>('idle');

  // Interactive Unit Circle state (Stage 3)
  const [unitCircleAngle, setUnitCircleAngle] = useState(30);

  // Analytics & History Log
  const [attemptsLog, setAttemptsLog] = useState<QuestionAttemptRecord[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`acadevia_trig_best_${studentId}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [hasCompletedAward, setHasCompletedAward] = useState(false);

  // Current stage configuration
  const currentStageConfig = useMemo(
    () => STAGE_CONFIGS.find((s) => s.id === currentStageId) || STAGE_CONFIGS[0],
    [currentStageId]
  );

  // Questions for the current stage
  const stageQuestions = useMemo(() => {
    return TRIG_QUESTIONS.filter((q) => q.stage === currentStageId);
  }, [currentStageId]);

  const currentQuestion = stageQuestions[stageQuestionIndex] || stageQuestions[0];

  // ----------------------------------------------------
  // Speed Round Timer Logic
  // ----------------------------------------------------
  useEffect(() => {
    if (gameState === 'playing' && currentStageId === 6) {
      setSpeedTimeLeft(30);
      speedTimerRef.current = setInterval(() => {
        setSpeedTimeLeft((prev) => {
          if (prev <= 1) {
            if (speedTimerRef.current) clearInterval(speedTimerRef.current);
            // End speed round and move to Stage 7
            handleStageClear();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (speedTimerRef.current) clearInterval(speedTimerRef.current);
      };
    }
  }, [gameState, currentStageId]);

  // ----------------------------------------------------
  // Start / Reset Game
  // ----------------------------------------------------
  const startGame = useCallback(() => {
    setGameState('playing');
    setCurrentStageId(1);
    setStageQuestionIndex(0);
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsLastAnswerCorrect(null);
    setBossHp(100);
    setAttemptsLog([]);
    setHasCompletedAward(false);
    questionStartTimeRef.current = Date.now();
  }, []);

  const startNextStage = useCallback(() => {
    if (currentStageId < 7) {
      setCurrentStageId((prev) => (prev + 1) as GameStageId);
      setStageQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsLastAnswerCorrect(null);
      setGameState('playing');
      questionStartTimeRef.current = Date.now();
    } else {
      handleGameComplete();
    }
  }, [currentStageId]);

  // ----------------------------------------------------
  // Stage Clearance Handler
  // ----------------------------------------------------
  const handleStageClear = useCallback(() => {
    // Award stage bonus
    setScore((prev) => prev + 25);
    if (currentStageId === 7) {
      handleGameComplete();
    } else {
      setGameState('stage-cleared');
    }
  }, [currentStageId]);

  // ----------------------------------------------------
  // Game Completion & Analytics Generation
  // ----------------------------------------------------
  const handleGameComplete = useCallback(async () => {
    setGameState('completed');

    // Calculate final XP and update best score
    const finalScore = score + 50; // Completion bonus
    setScore(finalScore);

    if (finalScore > bestScore) {
      setBestScore(finalScore);
      try {
        localStorage.setItem(`acadevia_trig_best_${studentId}`, finalScore.toString());
      } catch {
        // storage ignored
      }
    }

    // Award XP to Backend gamification & game service
    if (!hasCompletedAward) {
      setHasCompletedAward(true);
      try {
        await gameService.submitScore('trigonometry-quest', {
          score: finalScore,
          timeTaken: 360,
        });
      } catch (err) {
        console.warn('Game score submission fallback handled:', err);
      }
    }
  }, [score, bestScore, studentId, hasCompletedAward]);

  // ----------------------------------------------------
  // Handle Answer Selection
  // ----------------------------------------------------
  const handleSelectAnswer = (option: string) => {
    if (isAnswerSubmitted || gameState !== 'playing') return;

    setSelectedOption(option);
    setIsAnswerSubmitted(true);
    const timeTaken = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const isCorrect = option === currentQuestion.correctAnswer;
    setIsLastAnswerCorrect(isCorrect);

    // Record attempt
    const attempt: QuestionAttemptRecord = {
      questionId: currentQuestion.id,
      topic: currentQuestion.topic,
      subTopic: currentQuestion.subTopic,
      selectedAnswer: option,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeTakenSec: timeTaken,
      stage: currentStageId,
    };
    setAttemptsLog((prev) => [...prev, attempt]);

    if (isCorrect) {
      // Score calculation with speed bonus
      const speedBonus = timeTaken < 5 ? 5 : 0;
      const points = 10 + speedBonus;
      setScore((prev) => prev + points);

      // Combo management
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Combo bonus XP
      if (newCombo === 3) setScore((prev) => prev + 5);
      if (newCombo === 5) setScore((prev) => prev + 10);
      if (newCombo === 10) setScore((prev) => prev + 25);

      // Boss Battle (Stage 7) Damage
      if (currentStageId === 7) {
        setBossAnimation('hit');
        setBossHp((prev) => Math.max(0, prev - 18));
        setTimeout(() => setBossAnimation('idle'), 600);
      }
    } else {
      // Wrong answer
      setCombo(0);

      // Boss counterattack or lose life (except in speed round where timer is primary penalty)
      if (currentStageId !== 6) {
        if (currentStageId === 7) {
          setBossAnimation('attack');
          setTimeout(() => setBossAnimation('idle'), 600);
        }

        const remainingLives = lives - 1;
        setLives(remainingLives);
        if (remainingLives <= 0) {
          setTimeout(() => {
            setGameState('game-over');
          }, 1200);
          return;
        }
      }
    }

    // In Speed Round (Stage 6), automatically advance quickly
    if (currentStageId === 6) {
      setTimeout(() => {
        advanceQuestion();
      }, 700);
    }
  };

  // ----------------------------------------------------
  // Advance to Next Question in Current Stage
  // ----------------------------------------------------
  const advanceQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsLastAnswerCorrect(null);
    questionStartTimeRef.current = Date.now();

    // Check if stage is finished
    const nextIdx = stageQuestionIndex + 1;
    const required = currentStageConfig.requiredQuestions;

    if (nextIdx >= required || nextIdx >= stageQuestions.length) {
      handleStageClear();
    } else {
      setStageQuestionIndex(nextIdx);
    }
  };

  // ----------------------------------------------------
  // Calculate Topic Breakdown Analytics
  // ----------------------------------------------------
  const analyticsSummary = useMemo(() => {
    const topics: TrigTopic[] = [
      'sin',
      'cos',
      'tan',
      'specialAngles',
      'unitCircle',
      'quadrants',
      'angleFinding',
    ];

    const labels: Record<TrigTopic, string> = {
      sin: 'Sine Values',
      cos: 'Cosine Values',
      tan: 'Tangent Values',
      specialAngles: 'Special Angles',
      unitCircle: 'Unit Circle',
      quadrants: 'Quadrant Signs (ASTC)',
      angleFinding: 'Angle Finding',
    };

    const breakdowns: TopicPerformance[] = topics.map((t) => {
      const topicAttempts = attemptsLog.filter((a) => a.topic === t);
      const total = topicAttempts.length;
      const correct = topicAttempts.filter((a) => a.isCorrect).length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
      return { topic: t, label: labels[t], total, correct, accuracy };
    });

    const activeTopics = breakdowns.filter((b) => b.total > 0);
    const totalQuestions = attemptsLog.length;
    const totalCorrect = attemptsLog.filter((a) => a.isCorrect).length;
    const overallAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const strongest =
      activeTopics.length > 0
        ? [...activeTopics].sort((a, b) => b.accuracy - a.accuracy)[0]?.label
        : 'Sine & Cosine';

    const needsPractice =
      activeTopics.length > 0
        ? [...activeTopics].sort((a, b) => a.accuracy - b.accuracy)[0]?.label
        : 'Unit Circle';

    return {
      breakdowns,
      totalQuestions,
      totalCorrect,
      overallAccuracy,
      strongest,
      needsPractice,
    };
  }, [attemptsLog]);

  // Save report to localStorage for AI recommendation integration
  useEffect(() => {
    if (gameState === 'completed') {
      const report: TrigAnalyticsReport = {
        studentId,
        gameId: 'trigonometry-quest',
        timestamp: new Date().toISOString(),
        score,
        totalQuestions: analyticsSummary.totalQuestions,
        totalCorrect: analyticsSummary.totalCorrect,
        overallAccuracy: analyticsSummary.overallAccuracy,
        xpAwarded: 150,
        strongestTopic: analyticsSummary.strongest,
        needsPracticeTopic: analyticsSummary.needsPractice,
        topicBreakdown: analyticsSummary.breakdowns.reduce((acc, curr) => {
          acc[curr.topic] = {
            total: curr.total,
            correct: curr.correct,
            accuracy: curr.accuracy,
          };
          return acc;
        }, {} as Record<TrigTopic, { total: number; correct: number; accuracy: number }>),
        attemptsLog,
      };

      try {
        localStorage.setItem(
          `acadevia_trig_report_${studentId}`,
          JSON.stringify(report)
        );
      } catch {
        // localStorage ignored
      }
    }
  }, [gameState, score, analyticsSummary, attemptsLog, studentId]);

  // ====================================================
  // 1. RENDER: INTRO / START SCREEN
  // ====================================================
  if (gameState === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-2 sm:p-4">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTES.GAMES)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </button>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-sm relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5" />
                Mathematics · High School Trigonometry
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Trigonometry Quest
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-lg">
                Master the Unit Circle, special angles, and trigonometric functions through 7
                interactive combat stages.
              </p>

              {/* Learning objectives checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Exact values of sin, cos, tan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Special angles (0°, 30°, 45°, 60°, 90°)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Interactive unit circle coordinates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>ASTC quadrant signs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Finding angles from values</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>30s Speed challenge & Boss battle</span>
                </div>
              </div>

              {/* Start CTA */}
              <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={startGame}
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  className="shadow-md text-base px-8 py-3.5 cursor-pointer"
                >
                  START GAME
                </Button>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Award className="h-4 w-4 text-secondary" />
                  <span>Reward: +150 XP on completion</span>
                </div>
              </div>
            </div>

            {/* Right Status Card */}
            <div className="w-full md:w-72 bg-[#F8FAFC] dark:bg-gray-800/70 rounded-2xl p-5 border border-gray-200/70 dark:border-gray-700/60 space-y-4 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Student Player Stats
              </h3>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Player</span>
                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                  {studentName}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Best Score</span>
                <span className="font-bold text-primary text-base">{bestScore} pts</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Stages</span>
                <span className="font-bold text-gray-900 dark:text-white">7 Stages</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Lives</span>
                <div className="flex items-center gap-1 text-red-500">
                  <Heart className="h-4 w-4 fill-red-500" />
                  <Heart className="h-4 w-4 fill-red-500" />
                  <Heart className="h-4 w-4 fill-red-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7 Stages Roadmap Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            Quest Journey (7 Stages)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {STAGE_CONFIGS.map((stage) => (
              <div
                key={stage.id}
                className="bg-white dark:bg-card-dark rounded-xl p-3 border border-gray-200/80 dark:border-gray-800 text-center space-y-1 shadow-2xs"
              >
                <span className="text-xl block">{stage.icon}</span>
                <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                  {stage.title}
                </p>
                <span className="text-[10px] text-gray-400 block">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // 2. RENDER: STAGE CLEARED POPUP
  // ====================================================
  if (gameState === 'stage-cleared') {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-8 text-center shadow-lg space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl">
            {currentStageConfig.icon}
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Stage Cleared!
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {currentStageConfig.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Great job! You earned +25 Stage Bonus XP.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 flex items-center justify-around text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Current Score</span>
              <span className="text-xl font-bold text-primary">{score} pts</span>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <span className="text-xs text-gray-400 block">Next Stage</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Stage {currentStageId + 1} of 7
              </span>
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            onClick={startNextStage}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="w-full shadow-md cursor-pointer"
          >
            CONTINUE QUEST
          </Button>
        </motion.div>
      </div>
    );
  }

  // ====================================================
  // 3. RENDER: GAME OVER SCREEN
  // ====================================================
  if (gameState === 'game-over') {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-red-100 dark:border-red-950/40 bg-white dark:bg-card-dark p-8 text-center shadow-lg space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center text-3xl">
            💔
          </div>

          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Quest Incomplete
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Out of Lives!
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You reached {currentStageConfig.title}. Review the explanations and give it another try!
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 grid grid-cols-2 gap-2 text-center text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Score</span>
              <span className="text-lg font-bold text-primary">{score} pts</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Accuracy</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {analyticsSummary.overallAccuracy}%
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.GAMES)}
              className="flex-1 cursor-pointer"
            >
              Exit
            </Button>
            <Button
              variant="gradient"
              onClick={startGame}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="flex-1 shadow-md cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ====================================================
  // 4. RENDER: GAME COMPLETED / VICTORY SCREEN
  // ====================================================
  if (gameState === 'completed') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm text-center space-y-6"
        >
          {/* Trophy Header */}
          <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-300 mx-auto flex items-center justify-center text-4xl shadow-sm">
            🏆
          </div>

          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              Quest Mastered!
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              Trigonometry Quest Complete!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Congratulations {studentName}! You conquered all 7 stages and defeated the Trigonometry Titan.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
              <span className="text-xs text-gray-400 block font-medium">Final Score</span>
              <span className="text-xl font-extrabold text-primary">{score}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-xs text-gray-400 block font-medium">Accuracy</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {analyticsSummary.overallAccuracy}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-secondary/5 dark:bg-secondary/10 border border-secondary/10">
              <span className="text-xs text-gray-400 block font-medium">XP Earned</span>
              <span className="text-xl font-extrabold text-secondary">+150 XP</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10">
              <span className="text-xs text-gray-400 block font-medium">Max Combo</span>
              <span className="text-xl font-extrabold text-orange-500">{maxCombo}x 🔥</span>
            </div>
          </div>

          {/* Learning Diagnostics / Topic Breakdown */}
          <div className="text-left bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Topic Mastery Breakdown
              </h3>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Strongest: {analyticsSummary.strongest}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {analyticsSummary.breakdowns.map((item) => (
                <div key={item.topic} className="space-y-1">
                  <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300">
                    <span>{item.label}</span>
                    <span>
                      {item.correct}/{item.total} ({item.accuracy}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        item.accuracy >= 80
                          ? 'bg-emerald-500'
                          : item.accuracy >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
              <span>Next Suggested Focus:</span>
              <span className="font-bold text-primary">{analyticsSummary.needsPractice}</span>
            </div>
          </div>

          {/* Action Buttons */}
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
              onClick={startGame}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="w-full sm:flex-1 shadow-md cursor-pointer"
            >
              PLAY AGAIN
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ====================================================
  // 5. RENDER: ACTIVE GAMEPLAY (STAGES 1 to 7)
  // ====================================================
  const progressPercent = Math.round(
    ((currentStageId - 1) / 7) * 100 +
      ((stageQuestionIndex + 1) / currentStageConfig.requiredQuestions) * (100 / 7)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-2 sm:p-4 select-none">
      {/* HUD Header */}
      <div className="rounded-2xl bg-white dark:bg-card-dark border border-gray-200/80 dark:border-gray-800 px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Stage & Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{currentStageConfig.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Stage {currentStageId}/7
              </span>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {currentStageConfig.title}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Question {stageQuestionIndex + 1} of {currentStageConfig.requiredQuestions}
            </p>
          </div>
        </div>

        {/* Mid Stats: Combo & Speed Timer */}
        <div className="flex items-center gap-4">
          {combo >= 2 && (
            <div className="flex items-center gap-1 text-xs font-extrabold text-orange-500 animate-pulse bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800">
              <Flame className="h-3.5 w-3.5 fill-orange-500" />
              <span>COMBO x{combo}</span>
            </div>
          )}

          {currentStageId === 6 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 font-mono">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              <span>{speedTimeLeft}s</span>
            </div>
          )}

          {/* Lives */}
          {currentStageId !== 6 && (
            <div className="flex items-center gap-1" aria-label={`Lives: ${lives}`}>
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={cn(
                    'h-4 w-4 transition-all',
                    heart <= lives
                      ? 'text-red-500 fill-red-500'
                      : 'text-gray-300 dark:text-gray-700'
                  )}
                />
              ))}
            </div>
          )}

          {/* Score */}
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase font-medium block">Score</span>
            <span className="text-base font-extrabold text-primary">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Stage 7: Boss Battle Banner */}
      {currentStageId === 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'rounded-2xl p-4 border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4',
            bossAnimation === 'hit'
              ? 'bg-red-500/10 border-red-500'
              : bossAnimation === 'attack'
              ? 'bg-purple-500/10 border-purple-500'
              : 'bg-gray-900 text-white border-gray-800'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Trigonometry Titan (Boss)
              </h3>
              <p className="text-xs text-gray-400">
                {bossHp > 0
                  ? 'Answer correctly to damage the Titan!'
                  : 'Boss Defeated! Finish remaining questions to claim glory.'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-56 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Boss HP</span>
              <span>{bossHp}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300"
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stage 3: Interactive Unit Circle Visual Assistant */}
      {currentStageId === 3 && (
        <div className="mb-2">
          <UnitCircleSVG
            selectedAngle={unitCircleAngle}
            onSelectAngle={(p: UnitCirclePoint) => setUnitCircleAngle(p.deg)}
            interactive={true}
          />
        </div>
      )}

      {/* Main Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Question Topic & Prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-[11px] font-semibold text-primary">
              {currentQuestion.topic}
            </Badge>
            {currentQuestion.subTopic && (
              <span className="text-xs text-gray-400">· {currentQuestion.subTopic}</span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {currentQuestion.question}
          </h2>

          {currentQuestion.equation && (
            <div className="inline-block px-4 py-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 text-primary font-mono text-base font-bold my-1">
              {currentQuestion.equation}
            </div>
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;

            let buttonStyle =
              'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:border-primary/50 text-gray-900 dark:text-white';

            if (isAnswerSubmitted) {
              if (isCorrectAnswer) {
                buttonStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold';
              } else if (isSelected && !isCorrectAnswer) {
                buttonStyle =
                  'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300';
              } else {
                buttonStyle = 'border-gray-200 dark:border-gray-800 opacity-50';
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectAnswer(option)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all duration-200 text-sm font-semibold cursor-pointer group',
                  buttonStyle
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:bg-primary group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-base">{option}</span>
                </div>

                {isAnswerSubmitted && isCorrectAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Section */}
        <AnimatePresence>
          {isAnswerSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'rounded-2xl p-4 border text-xs sm:text-sm space-y-2',
                isLastAnswerCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              )}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {isLastAnswerCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Correct! +10 XP</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Not quite! Correct answer: {currentQuestion.correctAnswer}</span>
                    </>
                  )}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {currentQuestion.explanation}
              </p>

              {/* Next Question CTA (for non-speed round) */}
              {currentStageId !== 6 && (
                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={advanceQuestion}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                    className="cursor-pointer shadow-xs"
                  >
                    Next Question
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
