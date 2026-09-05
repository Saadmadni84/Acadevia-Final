import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Trophy,
  Zap,
  Gauge,
  RotateCcw,
  Flag,
  Flame,
  ArrowLeft,
  Timer,
  CheckCircle2,
  Crown,
  FastForward,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/utils';
import {
  TYPERUSH_PASSAGES,
  AI_RACERS,
  type TypeRushGrade,
  type TypeRushPassage,
} from './typeRushData';

type GameMode = 'solo' | 'time-trial' | 'practice';
type RaceState = 'lobby' | 'countdown' | 'racing' | 'finished';

interface CarRacer {
  id: string;
  name: string;
  avatar: string;
  isPlayer: boolean;
  progress: number; // 0 to 100%
  speed: number; // current speed km/h
  finishTime?: number; // in seconds
}

export const TypeRush: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const studentId = user?.id || 'guest_student';
  const studentName = user?.fullName || 'Speed Racer';

  // Grade detection from user profile (fallback: 6-8)
  const defaultGrade: TypeRushGrade = useMemo(() => {
    if (user?.className) {
      const match = user.className.match(/\d+/);
      if (match) {
        const gradeNum = parseInt(match[0], 10);
        if (gradeNum <= 2) return '1-2';
        if (gradeNum <= 5) return '3-5';
        if (gradeNum <= 8) return '6-8';
        if (gradeNum <= 10) return '9-10';
        return '11-12';
      }
    }
    return '6-8';
  }, [user]);

  const [selectedGrade, setSelectedGrade] = useState<TypeRushGrade>(defaultGrade);
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [raceState, setRaceState] = useState<RaceState>('lobby');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Race Mechanics State
  const [countdown, setCountdown] = useState<number>(3);
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string>('');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Cars in Race
  const [racers, setRacers] = useState<CarRacer[]>([]);

  // Hidden Input Focus Ref
  const inputRef = useRef<HTMLInputElement>(null);

  // Get active passage
  const currentPassages = TYPERUSH_PASSAGES[selectedGrade];
  const currentPassage: TypeRushPassage = currentPassages[passageIndex % currentPassages.length];
  const targetText = currentPassage.text;

  // Initialize Racers
  const initRacers = useCallback(() => {
    const list: CarRacer[] = [
      { id: 'player', name: studentName, avatar: '🏎️', isPlayer: true, progress: 0, speed: 0 },
      ...AI_RACERS.map((ai) => ({
        id: ai.id,
        name: ai.name,
        avatar: ai.avatar,
        isPlayer: false,
        progress: 0,
        speed: 0,
      })),
    ];
    setRacers(list);
  }, [studentName]);

  // Start Countdown Sequence
  const handleStartRace = () => {
    initRacers();
    setTypedChars('');
    setMistakesCount(0);
    setTotalKeystrokes(0);
    setStreak(0);
    setMaxStreak(0);
    setElapsedSeconds(0);
    setShowExitConfirm(false);
    setRaceState('countdown');
    setCountdown(3);
  };

  // Exit Race Confirmed: Stop everything and return to lobby without rewards
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setRaceState('lobby');
    setTypedChars('');
    setElapsedSeconds(0);
    setStreak(0);
    setRacers([]);
  };

  // Countdown Timer
  useEffect(() => {
    if (raceState !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setRaceState('racing');
      setStartTime(Date.now());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [countdown, raceState]);

  // Player Turbo Level
  const isTurboActive = streak >= 10;
  const isSuperTurbo = streak >= 20;

  // Real-time WPM Calculation (5 chars = 1 word)
  const currentWPM = useMemo(() => {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    const words = typedChars.length / 5;
    return Math.round(words / minutes) || 0;
  }, [elapsedSeconds, typedChars.length]);

  // Accuracy Calculation
  const accuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    const correct = totalKeystrokes - mistakesCount;
    return Math.max(0, Math.min(100, Math.round((correct / totalKeystrokes) * 100)));
  }, [totalKeystrokes, mistakesCount]);

  // Main Race Loop (Updates AI positions, elapsed time, and speed physics)
  useEffect(() => {
    if (raceState !== 'racing' || showExitConfirm) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0.1, (now - startTime) / 1000);
      setElapsedSeconds(elapsed);

      setRacers((prevRacers) => {
        return prevRacers.map((racer) => {
          if (racer.progress >= 100) return racer;

          if (racer.isPlayer) {
            const playerProgress = (typedChars.length / targetText.length) * 100;
            const baseSpeed = Math.min(220, currentWPM * 2.8);
            const boostMultiplier = isSuperTurbo ? 1.4 : isTurboActive ? 1.2 : 1.0;
            const currentSpeed = Math.round(baseSpeed * boostMultiplier);

            const finished = playerProgress >= 100;
            return {
              ...racer,
              progress: Math.min(100, playerProgress),
              speed: currentSpeed,
              finishTime: finished && !racer.finishTime ? elapsed : racer.finishTime,
            };
          } else {
            // AI Racer Physics
            if (gameMode === 'practice') return { ...racer, speed: 0, progress: 0 };

            const aiConfig = AI_RACERS.find((a) => a.id === racer.id);
            const targetWPM = currentPassage.targetWPM * (aiConfig?.speedMultiplier || 0.8);
            const targetCharsPerSec = (targetWPM * 5) / 60;

            // Minor natural randomized jitter in AI pace
            const randomPace = targetCharsPerSec * (0.92 + Math.random() * 0.16);
            const currentChars = elapsed * randomPace;
            const aiProgress = Math.min(100, (currentChars / targetText.length) * 100);
            const aiSpeed = Math.round(targetWPM * 2.5);

            const finished = aiProgress >= 100;
            return {
              ...racer,
              progress: aiProgress,
              speed: aiSpeed,
              finishTime: finished && !racer.finishTime ? elapsed : racer.finishTime,
            };
          }
        });
      });
    }, 100);

    return () => clearInterval(interval);
  }, [
    raceState,
    showExitConfirm,
    startTime,
    typedChars.length,
    targetText.length,
    currentWPM,
    isSuperTurbo,
    isTurboActive,
    gameMode,
    currentPassage.targetWPM,
  ]);

  // Check if Player Reached Finish Line
  const playerRacer = racers.find((r) => r.isPlayer);
  const playerProgress = playerRacer?.progress || 0;

  useEffect(() => {
    if (raceState === 'racing' && playerProgress >= 100) {
      setRaceState('finished');

      // Submit score to game service
      const finalScore = Math.round(currentWPM * 10 + accuracy * 5);
      gameService.submitScore('type-rush', {
        score: finalScore,
        timeTaken: Math.round(elapsedSeconds),
      }).catch(() => {});
    }
  }, [accuracy, currentWPM, elapsedSeconds, playerProgress, raceState]);

  // Keypress Typing Handler
  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (raceState !== 'racing' || showExitConfirm) return;

    const inputVal = e.target.value;
    const inputChar = inputVal.slice(-1);
    const expectedChar = targetText[typedChars.length];

    setTotalKeystrokes((k) => k + 1);

    if (inputChar === expectedChar) {
      const nextTyped = typedChars + inputChar;
      setTypedChars(nextTyped);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
    } else {
      // Mistake penalty: reset streak and increment mistake count
      setMistakesCount((m) => m + 1);
      setStreak(0);
    }
  };

  // Sorted leaderboard positions
  const leaderboard = useMemo(() => {
    return [...racers].sort((a, b) => b.progress - a.progress);
  }, [racers]);

  const playerPosition = leaderboard.findIndex((r) => r.isPlayer) + 1;

  // ==========================================
  // 1. LOBBY VIEW / CLASS & MODE SELECTION
  // ==========================================
  if (raceState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-2 sm:p-4 select-none">
        <button
          type="button"
          onClick={() => navigate(ROUTES.GAMES)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Games</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                🏎️ TypeRush · Typing Racing Championship
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Type Fast. Race Faster.
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg">
                Accelerate your racing car with accurate keystrokes! Build typing streaks to ignite <strong>TURBO</strong>, overtake AI champions, and conquer the track!
              </p>

              {/* Class Adaptation Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Select Your Class Level:
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {(['1-2', '3-5', '6-8', '9-10', '11-12'] as TypeRushGrade[]).map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer',
                        selectedGrade === grade
                          ? 'border-rose-500 bg-rose-500 text-white shadow-xs scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-rose-400'
                      )}
                    >
                      Class {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Modes */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Game Mode:
                </span>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => setGameMode('solo')}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer',
                      gameMode === 'solo'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    🏆 Grand Prix (vs 4 AI Racers)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameMode('practice')}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer',
                      gameMode === 'practice'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    🎯 Practice Mode
                  </button>
                </div>
              </div>

              {/* Enter Button */}
              <div className="pt-4 flex items-center justify-center md:justify-start gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleStartRace}
                  leftIcon={<Flame className="h-5 w-5 text-amber-200" />}
                  className="shadow-md text-base px-8 py-3.5 cursor-pointer bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 font-black"
                >
                  START RACE 🏁
                </Button>
              </div>
            </div>

            {/* Right Side Racer Card */}
            <div className="w-full md:w-64 bg-[#FFF1F2] dark:bg-gray-800/70 rounded-3xl p-6 border border-rose-200/80 dark:border-gray-700 text-center space-y-3 shrink-0">
              <div className="text-6xl animate-bounce">🏎️</div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {studentName}
              </h3>
              <p className="text-xs text-gray-500">
                Class {selectedGrade} Racer
              </p>
              <div className="pt-3 border-t border-rose-200 dark:border-gray-700 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Turbo on 10x Streak!</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // 2. ACTIVE RACE SCREEN & STICKY 2D TRACK VIEWPORT
  // ==========================================
  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="max-w-5xl mx-auto space-y-4 p-2 sm:p-4 select-none cursor-text relative"
    >
      {/* Hidden Typing Input */}
      <input
        ref={inputRef}
        type="text"
        value=""
        onChange={handleTypingInput}
        className="opacity-0 absolute pointer-events-none"
        autoFocus
      />

      {/* TOP STICKY ACTIVE RACE HUD: POSITION, SPEED, WPM, TURBO & PROMINENT EXIT BUTTON */}
      <div className="sticky top-2 z-40 rounded-3xl border-2 border-rose-300 dark:border-rose-900 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Race Standing */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white font-black text-lg flex items-center justify-center shadow-md">
            #{playerPosition}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">
              Race Standing
            </span>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white">
              Position {playerPosition} of {racers.length}
            </span>
          </div>
        </div>

        {/* Speedometer & Live WPM */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-rose-200 dark:border-gray-700 shadow-2xs">
            <Gauge className="h-4 w-4 text-rose-600" />
            <span className="text-xs font-extrabold text-gray-900 dark:text-white">
              {playerRacer?.speed || 0} km/h
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-rose-200 dark:border-gray-700 shadow-2xs">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-black text-amber-600">
              {currentWPM} WPM
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-rose-200 dark:border-gray-700 shadow-2xs">
            <Timer className="h-4 w-4 text-sky-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {elapsedSeconds.toFixed(1)}s
            </span>
          </div>

          {/* Streak Badge */}
          <div
            className={cn(
              'px-3 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all',
              isSuperTurbo
                ? 'bg-amber-500 text-white animate-pulse shadow-md'
                : isTurboActive
                ? 'bg-rose-500 text-white animate-bounce shadow-xs'
                : 'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
            )}
          >
            <Flame className="h-4 w-4" />
            <span>{isSuperTurbo ? 'SUPER TURBO!' : isTurboActive ? 'TURBO!' : `${streak}x Streak`}</span>
          </div>
        </div>

        {/* TOP-RIGHT EXIT RACE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowExitConfirm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-extrabold text-xs transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
          title="Exit active race"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Race</span>
        </button>
      </div>

      {/* 2D PHYSICAL MULTI-LANE RACE TRACK VIEWPORT (STICKY / ALWAYS VISIBLE) */}
      <div className="relative rounded-3xl border-4 border-slate-700 bg-[#1E293B] overflow-hidden shadow-2xl p-4 space-y-2.5">
        <div className="relative space-y-2.5 py-1">
          {racers.map((racer) => (
            <div
              key={racer.id}
              className={cn(
                'relative h-11 rounded-2xl border-2 flex items-center px-4 transition-all overflow-hidden',
                racer.isPlayer
                  ? 'bg-slate-800/90 border-rose-400 shadow-inner ring-2 ring-rose-400/30'
                  : 'bg-slate-900/60 border-slate-700'
              )}
            >
              {/* Lane Road Striping */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #fff, #fff 20px, transparent 20px, transparent 40px)',
                }}
              />

              {/* Finish Line Checkpoint Flag at 100% */}
              <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-xl z-10 pointer-events-none opacity-80">
                🏁
              </div>

              {/* Racer Name & Avatar Tag */}
              <div className="absolute left-3 z-10 text-[10px] font-black uppercase tracking-wider text-slate-400 pointer-events-none">
                {racer.isPlayer ? `⭐ ${racer.name}` : racer.name}
              </div>

              {/* Animated Vehicle Movement along Track Progress (0 to 92%) */}
              <motion.div
                animate={{ left: `${Math.min(92, Math.max(4, racer.progress * 0.92))}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute -translate-x-1/2 flex items-center gap-1 z-20"
              >
                <div
                  className={cn(
                    'w-9 h-7 rounded-xl flex items-center justify-center text-xl shadow-lg border-2',
                    racer.isPlayer
                      ? 'bg-rose-600 border-white ring-4 ring-rose-400/40'
                      : 'bg-slate-700 border-slate-400'
                  )}
                >
                  {racer.avatar}
                </div>

                {/* Speed Exhaust Particles for Player */}
                {racer.isPlayer && isTurboActive && (
                  <span className="text-sm animate-ping pointer-events-none">🔥</span>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Countdown Overlay */}
        {raceState === 'countdown' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-50">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-7xl font-black text-rose-500 drop-shadow-2xl"
            >
              {countdown > 0 ? countdown : 'GO! 🏎️💨'}
            </motion.div>
            <span className="text-xs font-bold text-white uppercase tracking-widest mt-2">
              Get Ready to Type!
            </span>
          </div>
        )}
      </div>

      {/* TYPING PROMPT & STREAM DISPLAY (The Real-time Accelerating Engine) */}
      <div className="rounded-3xl border-2 border-rose-300 dark:border-rose-900/60 bg-white dark:bg-card-dark p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-rose-600">
          <span>Typing Engine · Chapter: {currentPassage.category}</span>
          <span>Target Speed: {currentPassage.targetWPM} WPM</span>
        </div>

        {/* Character-by-Character Highlighting */}
        <div className="text-xl sm:text-2xl font-mono leading-relaxed tracking-wide bg-rose-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-rose-100 dark:border-gray-800 break-words">
          {targetText.split('').map((char, index) => {
            const isTyped = index < typedChars.length;
            const isCurrent = index === typedChars.length;

            return (
              <span
                key={index}
                className={cn(
                  'transition-colors',
                  isTyped
                    ? 'text-emerald-600 font-bold dark:text-emerald-400'
                    : isCurrent
                    ? 'bg-rose-500 text-white px-0.5 rounded font-black animate-pulse'
                    : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Tap anywhere to focus typing input</span>
          <span>Accuracy: <strong className="text-emerald-600">{accuracy}%</strong></span>
        </div>
      </div>

      {/* EXIT RACE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-rose-300 dark:border-rose-900 shadow-2xl space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 text-3xl flex items-center justify-center mx-auto">
                ⚠️
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Exit Race?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your current race will not be saved and no XP or stars will be awarded for this session.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="gradient"
                  size="md"
                  onClick={() => {
                    setShowExitConfirm(false);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="font-bold shadow-md cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  Continue Racing 🏎️
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleConfirmExit}
                  className="font-bold cursor-pointer border-rose-300 text-rose-600 dark:border-rose-800 dark:text-rose-400"
                >
                  Exit Race
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FINISH LINE RESULTS & PODIUM MODAL */}
      {raceState === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-slate-900 text-white border-4 border-rose-500 text-center space-y-5 shadow-2xl"
        >
          <div className="text-5xl animate-bounce">
            {playerPosition === 1 ? '🏆🥇' : playerPosition === 2 ? '🥈' : playerPosition === 3 ? '🥉' : '🏎️'}
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              Championship Race Complete
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              {playerPosition === 1 ? '1st Place Victory!' : `Finished in Position #${playerPosition}`}
            </h3>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block">Typing Speed</span>
              <span className="text-xl font-black text-amber-400">{currentWPM} WPM</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block">Accuracy</span>
              <span className="text-xl font-black text-emerald-400">{accuracy}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block">Max Streak</span>
              <span className="text-xl font-black text-rose-400">{maxStreak}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block">Time</span>
              <span className="text-xl font-black text-sky-400">{elapsedSeconds.toFixed(1)}s</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="gradient"
              size="md"
              onClick={handleStartRace}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="cursor-pointer font-bold shadow-md bg-gradient-to-r from-rose-500 to-amber-500"
            >
              Race Again ↺
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setRaceState('lobby')}
              className="cursor-pointer font-bold text-white border-slate-700"
            >
              Change Class / Mode
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
