import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Star,
  Trophy,
  Award,
  Atom,
  FlaskConical,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import { SCIENCE_CLASS6_GAMES } from './scienceCurriculum';
import type { ScienceClassGrade, ScienceGameId, ScienceGameMeta } from './types';
import { MagnetRescueGame } from './games/MagnetRescueGame';
import { WaterWorldGame } from './games/WaterWorldGame';
import { SeparationFactoryGame } from './games/SeparationFactoryGame';
import { MeasureMoveGame } from './games/MeasureMoveGame';
import { LifeExplorerGame } from './games/LifeExplorerGame';
import { ScienceDetectiveGame } from './games/ScienceDetectiveGame';
import { FoodLabRescueGame } from './games/FoodLabRescueGame';
import { SpaceMissionGame } from './games/SpaceMissionGame';
import { cn } from '@/lib/utils';

type LabViewState = 'grade-selection' | 'hub' | 'playing' | 'completed';

export const ScienceLab: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const studentId = user?.id || 'guest_student';
  const studentName = user?.fullName || 'Young Scientist';

  const detectedGrade: ScienceClassGrade = useMemo(() => {
    if (user?.className) {
      const match = user.className.match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (parsed >= 6 && parsed <= 8) return parsed as ScienceClassGrade;
      }
    }
    return 6;
  }, [user]);

  const [selectedGrade, setSelectedGrade] = useState<ScienceClassGrade>(detectedGrade);
  const [viewState, setViewState] = useState<LabViewState>('grade-selection');
  const [activeGameId, setActiveGameId] = useState<ScienceGameId>('magnet-rescue');
  const [completedGames, setCompletedGames] = useState<ScienceGameId[]>([]);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const sessionStorageKey = `acadevia_science_lab_session_${studentId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionStorageKey);
      if (!saved) return;
      const session = JSON.parse(saved);
      if (session.completedGames) setCompletedGames(session.completedGames);
      if (session.score) setScore(session.score);
      if (session.earnedXP) setEarnedXP(session.earnedXP);
      if (session.totalStars) setTotalStars(session.totalStars);
    } catch {
      localStorage.removeItem(sessionStorageKey);
    }
  }, [sessionStorageKey]);

  useEffect(() => {
    if (viewState === 'grade-selection') return;
    const session = {
      grade: selectedGrade,
      completedGames,
      score,
      earnedXP,
      totalStars,
    };
    try {
      localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }, [completedGames, earnedXP, score, selectedGrade, sessionStorageKey, totalStars, viewState]);

  const handleStartGame = (gameId: ScienceGameId) => {
    setActiveGameId(gameId);
    setViewState('playing');
  };

  const handleGameComplete = async () => {
    const game = SCIENCE_CLASS6_GAMES.find((g) => g.id === activeGameId);
    const xp = game?.xpReward || 35;
    const newXP = earnedXP + xp;
    const newScore = score + 50;
    const newStars = totalStars + 1;

    setEarnedXP(newXP);
    setScore(newScore);
    setTotalStars(newStars);

    const nextCompleted = Array.from(new Set([...completedGames, activeGameId]));
    setCompletedGames(nextCompleted);

    try {
      await gameService.submitScore('science-lab', {
        score: newScore,
        timeTaken: 180,
      });
    } catch {
      /* ignore */
    }

    setViewState('hub');
  };

  // ==========================================
  // 1. CLASS SELECTION SCREEN
  // ==========================================
  if (viewState === 'grade-selection') {
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
          className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
                🧪 Science Lab · Interactive Experimentation Simulator
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Welcome to Science Lab
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg">
                Explore. Experiment. Discover. Run genuine virtual physics, chemistry, biology, and space experiments aligned with your NCERT Science curriculum!
              </p>

              {/* Class Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Choose Your Class:
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {[6, 7, 8].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade as ScienceClassGrade)}
                      className={cn(
                        'px-5 py-2.5 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer',
                        selectedGrade === grade
                          ? 'border-cyan-500 bg-cyan-500 text-white shadow-xs scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-cyan-400'
                      )}
                    >
                      Class {grade} {grade === 6 ? '· Curiosity Lab (8 Mini-Games)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter Button */}
              <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => setViewState('hub')}
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  className="shadow-md text-base px-8 py-3.5 cursor-pointer bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500"
                >
                  ENTER SCIENCE LAB
                </Button>
              </div>
            </div>

            {/* Right Scientist Profile Card */}
            <div className="w-full md:w-64 bg-[#ECFEFF] dark:bg-gray-800/70 rounded-3xl p-6 border border-cyan-200/80 dark:border-gray-700 text-center space-y-3 shrink-0">
              <div className="text-5xl">🔬</div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {studentName}
              </h3>
              <p className="text-xs text-gray-500">
                Class {selectedGrade} Lead Scientist
              </p>
              <div className="pt-3 border-t border-cyan-200 dark:border-gray-700 text-xs font-bold text-cyan-700 flex items-center justify-center gap-1">
                <span>Physics</span>
                <span>·</span>
                <span>Chemistry</span>
                <span>·</span>
                <span>Biology</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // 2. SCIENCE LAB GAME HUB (8 PLAYABLE MINI-GAMES)
  // ==========================================
  if (viewState === 'hub') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 select-none">
        {/* Navigation & Live HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewState('grade-selection')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary cursor-pointer"
          >
            <span>← Change Class</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1 text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              <Star className="h-3.5 w-3.5 fill-cyan-500 text-cyan-500" />
              <span>{totalStars} Stars Earned</span>
            </div>
            <div className="flex items-center gap-1 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{earnedXP} XP</span>
            </div>
          </div>
        </div>

        {/* Hub Banner */}
        <div className="rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="text-4xl sm:text-5xl animate-bounce">🔬</div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Class 6 Science Lab: Curiosity
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                8 Interactive experiment simulators across Physics, Chemistry, Biology & Space!
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-card-dark border border-cyan-200 text-xs font-extrabold text-cyan-800 dark:text-cyan-200 shadow-2xs">
            {completedGames.length} / 8 Experiments Mastered
          </div>
        </div>

        {/* 8 Playable Mini-Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SCIENCE_CLASS6_GAMES.map((game) => {
            const isCompleted = completedGames.includes(game.id);

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -4 }}
                className={cn(
                  'rounded-3xl border-2 p-5 flex flex-col justify-between transition-all relative overflow-hidden bg-white dark:bg-card-dark shadow-sm',
                  isCompleted ? 'border-emerald-400 bg-emerald-50/20' : 'border-gray-200 dark:border-gray-800 hover:border-cyan-400'
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{game.avatar}</span>
                    {isCompleted && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Mastered ✓
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 block mt-3">
                    {game.curriculumChapter}
                  </span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                    {game.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                    {game.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                    <span>⚡ +{game.xpReward} XP</span>
                    <span>⏱ {game.estimatedTime}</span>
                  </div>

                  <Button
                    variant={isCompleted ? 'outline' : 'gradient'}
                    size="sm"
                    onClick={() => handleStartGame(game.id)}
                    className="w-full font-bold cursor-pointer shadow-xs text-xs"
                  >
                    {isCompleted ? 'Re-run Experiment ↺' : 'Launch Experiment →'}
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
  // 3. PLAYING SELECTED MINI-GAME
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto space-y-4 p-2 select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewState('hub')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
        >
          <span>← Back to Science Lab Hub</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-cyan-600">
          Class 6 Curiosity Experiments
        </span>
      </div>

      {activeGameId === 'magnet-rescue' && <MagnetRescueGame onComplete={handleGameComplete} />}
      {activeGameId === 'water-world' && <WaterWorldGame onComplete={handleGameComplete} />}
      {activeGameId === 'separation-factory' && <SeparationFactoryGame onComplete={handleGameComplete} />}
      {activeGameId === 'measure-move' && <MeasureMoveGame onComplete={handleGameComplete} />}
      {activeGameId === 'life-explorer' && <LifeExplorerGame onComplete={handleGameComplete} />}
      {activeGameId === 'science-detective' && <ScienceDetectiveGame onComplete={handleGameComplete} />}
      {activeGameId === 'food-lab-rescue' && <FoodLabRescueGame onComplete={handleGameComplete} />}
      {activeGameId === 'space-mission' && <SpaceMissionGame onComplete={handleGameComplete} />}
    </div>
  );
};
