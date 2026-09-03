import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Heart,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import type {
  WorldId,
  StudentClassGrade,
  PetType,
  MathTopic,
  NumberKingdomAnalyticsReport,
  MissionResult,
  SchoolClass,
} from './types';
import {
  KINGDOM_WORLDS,
  PET_COMPANIONS,
  getMissionsForWorld,
} from './missionGenerator';
import { KingdomMap } from './KingdomMap';
import { InteractiveMissionView } from './InteractiveMissionView';
import { cn } from '@/lib/utils';

type KingdomGameState = 'intro' | 'map' | 'mission' | 'game-over' | 'completed';

interface NumberKingdomSession {
  grade: SchoolClass;
  companion: PetType;
  gameState: Exclude<KingdomGameState, 'intro'>;
  activeWorldId: WorldId;
  unlockedWorlds: WorldId[];
  completedWorlds: WorldId[];
  worldStars: Record<WorldId, number>;
  score: number;
  lives: number;
  earnedXP: number;
  resultsLog: MissionResult[];
}

const SCHOOL_CLASSES: SchoolClass[] = [1, 2, 3, 4, 5];
const isSchoolClass = (value: unknown): value is SchoolClass =>
  typeof value === 'number' && SCHOOL_CLASSES.includes(value as SchoolClass);
const isPetType = (value: unknown): value is PetType =>
  typeof value === 'string' && PET_COMPANIONS.some((pet) => pet.id === value);

export const NumberKingdom: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const studentId = user?.id || 'guest_student';
  const studentName = user?.fullName || 'Young Explorer';

  // Detect user's grade or default to Class 2
  const detectedGrade: StudentClassGrade = useMemo(() => {
    if (user?.className) {
      const match = user.className.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (parsed >= 1 && parsed <= 5) return parsed as StudentClassGrade;
      }
    }
    return 2;
  }, [user]);

  // Game States
  const [gameState, setGameState] = useState<KingdomGameState>('intro');
  const [selectedClassGrade, setSelectedClassGrade] = useState<StudentClassGrade>(detectedGrade);
  const [selectedPet, setSelectedPet] = useState<PetType>('puppy');
  const [activeWorldId, setActiveWorldId] = useState<WorldId>('village');
  const [unlockedWorlds, setUnlockedWorlds] = useState<WorldId[]>(['village']);
  const [completedWorlds, setCompletedWorlds] = useState<WorldId[]>([]);
  const [worldStars, setWorldStars] = useState<Record<WorldId, number>>({
    village: 0,
    forest: 0,
    bridge: 0,
    garden: 0,
    market: 0,
    builder: 0,
    railway: 0,
    tower: 0,
    dragon: 0,
    castle: 0,
  });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [earnedXP, setEarnedXP] = useState(0);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [resultsLog, setResultsLog] = useState<MissionResult[]>([]);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);
  const [sessionGrade, setSessionGrade] = useState<SchoolClass | null>(null);

  const sessionStorageKey = `acadevia_number_kingdom_session_${studentId}`;

  // A Number Kingdom session travels with the student through setup → map → mission and survives refresh.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionStorageKey);
      if (!saved) return;
      const session = JSON.parse(saved) as Partial<NumberKingdomSession>;
      if (!isSchoolClass(session.grade) || !isPetType(session.companion) || !session.activeWorldId || !session.worldStars) return;

      setSelectedClassGrade(session.grade);
      setSelectedPet(session.companion);
      setSessionGrade(session.grade);
      setActiveWorldId(session.activeWorldId);
      setUnlockedWorlds(session.unlockedWorlds ?? ['village']);
      setCompletedWorlds(session.completedWorlds ?? []);
      setWorldStars(session.worldStars);
      setScore(session.score ?? 0);
      setLives(session.lives ?? 3);
      setEarnedXP(session.earnedXP ?? 0);
      setResultsLog(session.resultsLog ?? []);
      setGameState(session.gameState === 'mission' ? 'mission' : 'map');
    } catch {
      localStorage.removeItem(sessionStorageKey);
    } finally {
      setHasHydratedSession(true);
    }
  }, [sessionStorageKey]);

  useEffect(() => {
    if (!hasHydratedSession || gameState === 'intro') return;
    const session: NumberKingdomSession = {
      grade: selectedClassGrade,
      companion: selectedPet,
      gameState,
      activeWorldId,
      unlockedWorlds,
      completedWorlds,
      worldStars,
      score,
      lives,
      earnedXP,
      resultsLog,
    };
    try { localStorage.setItem(sessionStorageKey, JSON.stringify(session)); } catch { /* storage unavailable */ }
  }, [activeWorldId, completedWorlds, earnedXP, gameState, hasHydratedSession, lives, resultsLog, score, selectedClassGrade, selectedPet, sessionStorageKey, unlockedWorlds, worldStars]);

  // Get active mission
  const currentWorldMissions = useMemo(
    () => getMissionsForWorld(activeWorldId, selectedClassGrade),
    [activeWorldId, selectedClassGrade]
  );
  const activeMission = currentWorldMissions[0];

  const enterKingdom = () => {
    // Starting a different class must never reuse another class's missions or rewards.
    if (sessionGrade !== selectedClassGrade) {
      setActiveWorldId('village');
      setUnlockedWorlds(['village']);
      setCompletedWorlds([]);
      setWorldStars({ village: 0, forest: 0, bridge: 0, garden: 0, market: 0, builder: 0, railway: 0, tower: 0, dragon: 0, castle: 0 });
      setScore(0);
      setLives(3);
      setEarnedXP(0);
      setResultsLog([]);
    }
    setSessionGrade(selectedClassGrade);
    setGameState('map');
  };

  // Total stars collected
  const totalStars = useMemo(
    () => Object.values(worldStars).reduce((a, b) => a + b, 0),
    [worldStars]
  );

  // ----------------------------------------------------
  // Handle Mission Completion
  // ----------------------------------------------------
  const handleMissionComplete = (isSuccess: boolean, timeSpentSec: number) => {
    if (isSuccess) {
      // Award stars & points
      const starsAwarded = 3;
      const points = 25;
      const xp = 15;

      setScore((prev) => prev + points);
      setEarnedXP((prev) => Math.min(150, prev + xp));

      // Record results
      setResultsLog((prev) => [
        ...prev,
        {
          missionId: activeMission.id,
          worldId: activeWorldId,
          topic: activeMission.topic,
          isSuccess: true,
          timeSpentSec,
          starsEarned: starsAwarded,
          xpEarned: xp,
        },
      ]);

      // Update world stars & completed
      setWorldStars((prev) => ({
        ...prev,
        [activeWorldId]: Math.max(prev[activeWorldId] || 0, starsAwarded),
      }));

      if (!completedWorlds.includes(activeWorldId)) {
        const nextCompleted = [...completedWorlds, activeWorldId];
        setCompletedWorlds(nextCompleted);

        // Check next world to unlock
        const currentWorldIndex = KINGDOM_WORLDS.findIndex((w) => w.id === activeWorldId);
        if (currentWorldIndex < KINGDOM_WORLDS.length - 1) {
          const nextWorld = KINGDOM_WORLDS[currentWorldIndex + 1];
          if (!unlockedWorlds.includes(nextWorld.id)) {
            setUnlockedWorlds((prev) => [...prev, nextWorld.id]);
          }
        }
      }

      // If finished final castle:
      if (activeWorldId === 'castle') {
        handleFinalVictory();
      } else {
        setGameState('map');
      }
    } else {
      // Failed attempt
      setResultsLog((prev) => [
        ...prev,
        {
          missionId: activeMission.id,
          worldId: activeWorldId,
          topic: activeMission.topic,
          isSuccess: false,
          timeSpentSec,
          starsEarned: 0,
          xpEarned: 0,
        },
      ]);

      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        setGameState('game-over');
      } else {
        setGameState('map');
      }
    }
  };

  // ----------------------------------------------------
  // Final Victory Handler
  // ----------------------------------------------------
  const handleFinalVictory = useCallback(async () => {
    setGameState('completed');
    const finalScore = score + 100;
    setScore(finalScore);
    const finalXP = Math.min(150, earnedXP + 50);
    setEarnedXP(finalXP);

    if (!hasSubmittedScore) {
      setHasSubmittedScore(true);
      try {
        await gameService.submitScore('number-kingdom', {
          score: finalScore,
          timeTaken: 420,
        });
      } catch (err) {
        console.warn('Number kingdom score submission fallback:', err);
      }
    }
  }, [score, earnedXP, hasSubmittedScore]);

  // ----------------------------------------------------
  // Calculate Analytics Summary for AI Recommendations
  // ----------------------------------------------------
  const analyticsSummary = useMemo(() => {
    const topics: MathTopic[] = [
      'counting',
      'addition',
      'subtraction',
      'money',
      'multiplication',
      'division',
      'fractions',
      'measurement',
      'data',
      'angles',
      'spatial',
      'geometry',
      'patterns',
      'multiStep',
    ];

    const labels: Record<MathTopic, string> = {
      counting: 'Counting & Quantities',
      addition: 'Addition & Sums',
      subtraction: 'Subtraction & Take Away',
      money: 'Money & Change Calculation',
      multiplication: 'Multiplication & Grouping',
      geometry: 'Geometry & Grid Construction',
      patterns: 'Number Patterns & Sequences',
      multiStep: 'Multi-Step Problem Solving',
      numberRecognition: 'Number Recognition',
      quantity: 'Counting & Quantities',
      moreLess: 'Number Comparison',
      shapes: 'Shapes & Geometry',
      division: 'Equal Sharing & Division',
      fractions: 'Fractions',
      measurement: 'Measurement & Time',
      data: 'Data Interpretation',
      angles: 'Angles & Turns',
      spatial: 'Maps & Spatial Reasoning',
    };

    const breakdown = topics.map((t) => {
      const topicResults = resultsLog.filter((r) => r.topic === t);
      const total = topicResults.length;
      const correct = topicResults.filter((r) => r.isSuccess).length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
      return { topic: t, label: labels[t], total, correct, accuracy };
    });

    const activeTopics = breakdown.filter((b) => b.total > 0);
    const totalMissions = resultsLog.length;
    const totalCorrect = resultsLog.filter((r) => r.isSuccess).length;
    const overallAccuracy =
      totalMissions > 0 ? Math.round((totalCorrect / totalMissions) * 100) : 100;

    const strongest =
      activeTopics.length > 0
        ? [...activeTopics].sort((a, b) => b.accuracy - a.accuracy)[0]?.label
        : 'Counting & Addition';

    const needsPractice =
      activeTopics.length > 0
        ? [...activeTopics].sort((a, b) => a.accuracy - b.accuracy)[0]?.label
        : 'Patterns';

    return {
      breakdown,
      totalMissions,
      totalCorrect,
      overallAccuracy,
      strongest,
      needsPractice,
    };
  }, [resultsLog]);

  // Persist structured analytics report
  useEffect(() => {
    if (gameState === 'completed') {
      const report: NumberKingdomAnalyticsReport = {
        studentId,
        gameId: 'number-kingdom',
        studentClass: selectedClassGrade,
        totalScore: score,
        totalStars,
        totalXpAwarded: earnedXP,
        completedWorlds,
        overallAccuracy: analyticsSummary.overallAccuracy,
        strongestTopic: analyticsSummary.strongest,
        needsPracticeTopic: analyticsSummary.needsPractice,
        topicPerformance: analyticsSummary.breakdown.reduce((acc, curr) => {
          acc[curr.topic] = {
            total: curr.total,
            correct: curr.correct,
            accuracy: curr.accuracy,
          };
          return acc;
        }, {} as Record<MathTopic, { total: number; correct: number; accuracy: number }>),
        timestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem(
          `acadevia_number_kingdom_report_${studentId}`,
          JSON.stringify(report)
        );
      } catch {
        // localStorage ignored
      }
    }
  }, [
    gameState,
    score,
    totalStars,
    earnedXP,
    completedWorlds,
    analyticsSummary,
    studentId,
    selectedClassGrade,
  ]);

  // ====================================================
  // 1. RENDER: INTRO SCREEN
  // ====================================================
  if (gameState === 'intro') {
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

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                👑 Mathematics Adventure · Classes 1–5
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Number Kingdom
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg">
                Welcome {studentName}! Embark on an interactive math adventure across magical
                realms. Master Star Village, repair Number Bridge, dispatch Dragon Deliveries,
                brew in Wizard's Potion Lab, and expand the realm in Kingdom Builder!
              </p>

              {/* Class Level Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Select Your School Grade (Adapts Missions):
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedClassGrade(grade as StudentClassGrade)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer',
                        selectedClassGrade === grade
                          ? 'border-primary bg-primary text-white shadow-xs scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary/40'
                      )}
                    >
                      Class {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Companion Chooser */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Choose Your Companion Pet:
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  {PET_COMPANIONS.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setSelectedPet(pet.id)}
                      className={cn(
                        'px-3.5 py-2 rounded-xl text-xs font-bold border-2 flex items-center gap-1.5 transition-all cursor-pointer',
                        selectedPet === pet.id
                          ? 'border-secondary bg-secondary/15 text-gray-900 dark:text-white ring-2 ring-secondary/30 scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      <span className="text-lg">{pet.avatar}</span>
                      <span>{pet.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={enterKingdom}
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  className="shadow-md text-base px-8 py-3.5 cursor-pointer"
                >
                  ENTER THE KINGDOM
                </Button>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Award className="h-4 w-4 text-secondary" />
                  <span>Reward: +150 XP on completion</span>
                </div>
              </div>
            </div>

            {/* Right Explorer Badge */}
            <div className="w-full md:w-64 bg-[#F8FAFC] dark:bg-gray-800/70 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-700 text-center space-y-3 shrink-0">
              <div className="text-5xl">👑</div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {studentName}
              </h3>
              <p className="text-xs text-gray-500">
                Class {selectedClassGrade} Explorer
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-xs font-bold text-primary flex items-center justify-center gap-1">
                <span>9 Kingdom Worlds</span>
                <span>·</span>
                <span>35+ Missions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ====================================================
  // 2. RENDER: GAME OVER SCREEN
  // ====================================================
  if (gameState === 'game-over') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-red-200 dark:border-red-950/40 bg-white dark:bg-card-dark p-8 text-center shadow-lg space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center text-3xl">
            💔
          </div>

          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Adventure Paused
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Out of Energy!
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You collected {totalStars} stars! Rest up and try the missions again.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setGameState('map')}
              className="flex-1 cursor-pointer"
            >
              Back to Map
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                setLives(3);
                setGameState('map');
              }}
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
  // 3. RENDER: FINAL VICTORY / CORONATION
  // ====================================================
  if (gameState === 'completed') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 select-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-amber-200/80 dark:border-amber-800 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-sm text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 to-amber-500 text-white mx-auto flex items-center justify-center text-4xl shadow-md">
            👑
          </div>

          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              Kingdom Saved!
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              You are the Number Master!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Congratulations {studentName}! You conquered all 9 realms in Number Kingdom for
              Class {selectedClassGrade}.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
              <span className="text-xs text-gray-400 block font-medium">Final Score</span>
              <span className="text-xl font-extrabold text-primary">{score}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100">
              <span className="text-xs text-gray-400 block font-medium">Total Stars</span>
              <span className="text-xl font-extrabold text-secondary">{totalStars} ⭐</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100">
              <span className="text-xs text-gray-400 block font-medium">XP Reward</span>
              <span className="text-xl font-extrabold text-emerald-600">+150 XP</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100">
              <span className="text-xs text-gray-400 block font-medium">Realms Saved</span>
              <span className="text-xl font-extrabold text-purple-600">9 / 9 🏰</span>
            </div>
          </div>

          {/* Topic Performance Breakdown */}
          <div className="text-left bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Mathematics Mastery
              </h3>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Strongest: {analyticsSummary.strongest}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {analyticsSummary.breakdown.map((item) => (
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
          </div>

          {/* Action CTAs */}
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
                setGameState('map');
              }}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="w-full sm:flex-1 shadow-md cursor-pointer"
            >
              REPLAY REALMS
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ====================================================
  // 4. RENDER: MAP SCREEN & MISSION VIEW
  // ====================================================
  return (
    <div className="max-w-6xl mx-auto space-y-5 p-1 sm:p-2 select-none">
      {/* Top HUD Bar */}
      <div className="rounded-2xl bg-white dark:bg-card-dark border border-gray-200/80 dark:border-gray-800 px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Title & Player */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">👑</span>
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider block">
              Number Kingdom
            </span>
            <span className="text-[11px] text-gray-500">
              {studentName} · Class {selectedClassGrade}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setGameState('intro')}
          className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300"
        >
          Change class or companion
        </button>

        {/* Stats */}
        <div className="flex items-center gap-5 text-xs font-extrabold">
          {/* Stars */}
          <div className="flex items-center gap-1 text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 fill-secondary" />
            <span>{totalStars} Stars</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            <span>+{earnedXP} XP</span>
          </div>

          {/* Lives */}
          <div className="flex items-center gap-1" aria-label={`Lives: ${lives}`}>
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={cn(
                  'h-4 w-4 transition-all',
                  heart <= lives ? 'text-red-500 fill-red-500' : 'text-gray-300 dark:text-gray-700'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Render Active View */}
      {gameState === 'map' ? (
        <KingdomMap
          unlockedWorlds={unlockedWorlds}
          completedWorlds={completedWorlds}
          worldStars={worldStars}
          selectedWorld={activeWorldId}
          selectedPet={selectedPet}
          onSelectWorld={(wId) => {
            setActiveWorldId(wId);
            setGameState('mission');
          }}
        />
      ) : activeMission ? (
        <InteractiveMissionView
          mission={activeMission}
          selectedPet={selectedPet}
          onComplete={handleMissionComplete}
          onBackToMap={() => setGameState('map')}
        />
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-lg font-extrabold text-amber-950">Oops! We couldn’t load this adventure.</p>
          <p className="mt-2 text-sm text-amber-800">Please go back and select your class again.</p>
          <Button className="mt-5" variant="outline" onClick={() => setGameState('intro')}>Back to setup</Button>
        </div>
      )}
    </div>
  );
};
