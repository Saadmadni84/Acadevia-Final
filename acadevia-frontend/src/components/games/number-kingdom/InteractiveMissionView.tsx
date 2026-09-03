import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Hammer,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { InteractiveMission, PetType } from './types';
import { PET_COMPANIONS, KINGDOM_WORLDS } from './missionGenerator';
import { NumberBridgeGame } from './games/NumberBridgeGame';
import { DragonDeliveryGame } from './games/DragonDeliveryGame';
import { WizardPotionLabGame } from './games/WizardPotionLabGame';
import { KingdomBuilderGame } from './games/KingdomBuilderGame';
import { cn } from '@/lib/utils';

interface InteractiveMissionViewProps {
  mission: InteractiveMission;
  selectedPet: PetType;
  onComplete: (isSuccess: boolean, timeSpentSec: number) => void;
  onBackToMap: () => void;
}

export const InteractiveMissionView: React.FC<InteractiveMissionViewProps> = ({
  mission,
  selectedPet,
  onComplete,
  onBackToMap,
}) => {
  const currentPet =
    PET_COMPANIONS.find((p) => p.id === selectedPet) || PET_COMPANIONS[0];
  const worldConfig =
    KINGDOM_WORLDS.find((w) => w.id === mission.worldId) || KINGDOM_WORLDS[0];

  const startTimeRef = useRef<number>(0);

  // Mission 1: Village Explorer Coordinates
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 75 });
  const [collectedStars, setCollectedStars] = useState<number[]>([]);
  const [visitedHouse, setVisitedHouse] = useState<number | null>(null);

  // Mission 2: Train Boarding
  const [boardedCount, setBoardedCount] = useState<number>(0);
  const [trainDeparted, setTrainDeparted] = useState<boolean>(false);

  // Mission 3: Wizard Tower
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [doorOpen, setDoorOpen] = useState<boolean>(false);

  // Mission 4: More or Less Forest
  const [selectedPath, setSelectedPath] = useState<'Path A' | 'Path B' | null>(null);

  // Mission 5: Magic Bridge
  const [bridgeBlocksAdded, setBridgeBlocksAdded] = useState<number>(0);

  // Mission 6: Shape House
  const [placedShapes, setPlacedShapes] = useState<Record<string, boolean>>({
    roof: false,
    body: false,
    door: false,
    window: false,
  });

  // Mission 7: Pattern Garden
  const [selectedGardenItem, setSelectedGardenItem] = useState<string | null>(null);

  // Mission 8: Royal Castle Trials
  const [castleTrialIndex, setCastleTrialIndex] = useState<number>(0);
  const [adaptiveAnswer, setAdaptiveAnswer] = useState<number | string | null>(null);

  // Common Mission Resolution
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  useEffect(() => {
    startTimeRef.current = Date.now();
    const resetTimer = window.setTimeout(() => {
      setPlayerPos({ x: 50, y: 75 });
      setCollectedStars([]);
      setVisitedHouse(null);
      setBoardedCount(0);
      setTrainDeparted(false);
      setSelectedDoor(null);
      setDoorOpen(false);
      setSelectedPath(null);
      setBridgeBlocksAdded(0);
      setPlacedShapes({ roof: false, body: false, door: false, window: false });
      setSelectedGardenItem(null);
      setCastleTrialIndex(0);
      setAdaptiveAnswer(null);
      setIsResolved(false);
      setIsSuccess(null);
      setFeedbackMessage('');
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [mission]);

  // Keyboard controls for Village Explorer (WASD / Arrows)
  useEffect(() => {
    if (mission.id === 'c1_m1_village' && !isResolved) {
      const handleKeyDown = (e: KeyboardEvent) => {
        const step = 10;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          setPlayerPos((p) => ({ ...p, y: Math.max(15, p.y - step) }));
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          setPlayerPos((p) => ({ ...p, y: Math.min(85, p.y + step) }));
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setPlayerPos((p) => ({ ...p, x: Math.max(10, p.x - step) }));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setPlayerPos((p) => ({ ...p, x: Math.min(90, p.x + step) }));
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mission.id, isResolved]);

  // ----------------------------------------------------
  // Mission 1: Village Star Hunt & House Check
  // ----------------------------------------------------
  const handleCollectStar = (starId: number) => {
    if (!collectedStars.includes(starId)) {
      setCollectedStars((prev) => [...prev, starId]);
    }
  };

  const handleTouchHouse = (houseNum: number) => {
    if (isResolved) return;
    setVisitedHouse(houseNum);
    const target = mission.payload.targetHouseNumber || 4;
    if (houseNum === target) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    } else {
      setFeedbackMessage(`House #${houseNum} is friendly, but the King's star is in House #${target}! Let's look again.`);
    }
  };

  // ----------------------------------------------------
  // Mission 2: Train Passenger Boarding
  // ----------------------------------------------------
  const handleBoardPassenger = () => {
    if (isResolved) return;
    const target = mission.payload.neededPassengers || 3;
    const nextCount = boardedCount + 1;
    setBoardedCount(nextCount);

    if (nextCount === target) {
      setTrainDeparted(true);
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    }
  };

  // ----------------------------------------------------
  // Mission 3: Wizard Tower Doors
  // ----------------------------------------------------
  const handleChooseDoor = (starCount: number) => {
    if (isResolved) return;
    setSelectedDoor(starCount);
    const target = mission.payload.targetDoorStars || 4;

    if (starCount === target) {
      setDoorOpen(true);
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    } else {
      setFeedbackMessage(`That door has ${starCount} stars. Count the stars and find the door with 4 stars!`);
    }
  };

  // ----------------------------------------------------
  // Mission 4: More or Less Forest Paths
  // ----------------------------------------------------
  const handleChoosePath = (path: 'Path A' | 'Path B') => {
    if (isResolved) return;
    setSelectedPath(path);
    const isCorrect = path === 'Path B';

    if (isCorrect) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    } else {
      setFeedbackMessage('Path A has 2 rabbits. Path B has 4 rabbits. Path B has MORE!');
    }
  };

  // ----------------------------------------------------
  // Mission 5: Magic Bridge Addition
  // ----------------------------------------------------
  const handleAddBridgeBlock = () => {
    if (isResolved) return;
    const target = mission.payload.targetQuantity || 2;
    const nextCount = bridgeBlocksAdded + 1;
    setBridgeBlocksAdded(nextCount);

    if (nextCount === target) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    }
  };

  // ----------------------------------------------------
  // Mission 6: Shape House Builder
  // ----------------------------------------------------
  const handlePlaceShape = (slot: 'roof' | 'body' | 'door' | 'window') => {
    if (isResolved) return;
    const next = { ...placedShapes, [slot]: true };
    setPlacedShapes(next);

    if (next.roof && next.body && next.door && next.window) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    }
  };

  // ----------------------------------------------------
  // Mission 7: Pattern Garden
  // ----------------------------------------------------
  const handleSelectGardenItem = (item: string) => {
    if (isResolved) return;
    setSelectedGardenItem(item);
    const isCorrect = item === mission.payload.correctAnswer;

    if (isCorrect) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    } else {
      setFeedbackMessage(`The sequence repeats: Star, Circle, Star, Circle... next is ⭐!`);
    }
  };

  // ----------------------------------------------------
  // Mission 8: Royal Castle Trials
  // ----------------------------------------------------
  const handleCastleTrialStep = () => {
    if (isResolved) return;
    const nextStep = castleTrialIndex + 1;
    setCastleTrialIndex(nextStep);

    if (nextStep >= 4) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    }
  };

  const handleNext = () => {
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onComplete(isSuccess ?? false, timeSpent);
  };

  const adaptiveOptions = (() => {
    if (mission.payload.options) return mission.payload.options;
    const answer = mission.payload.correctAnswer;
    if (typeof answer === 'string') return [answer, 'Not quite', 'Try another clue'].sort();
    return Array.from(new Set([answer, Math.max(0, answer - 1), answer + 1, answer + 2]));
  })();

  const handleAdaptiveAnswer = (answer: number | string) => {
    if (isResolved) return;
    setAdaptiveAnswer(answer);
    if (answer === mission.payload.correctAnswer) {
      setIsResolved(true);
      setIsSuccess(true);
      setFeedbackMessage(mission.mathExplanation);
    } else {
      setFeedbackMessage(`Good try! ${mission.prompt} Think about ${mission.instruction.toLowerCase()}`);
    }
  };

  // Return Grade 2–5 dedicated interactive mini-games
  if (mission.classGrade === 2) {
    return (
      <NumberBridgeGame
        currentPet={currentPet}
        onComplete={onComplete}
        onBackToMap={onBackToMap}
      />
    );
  }

  if (mission.classGrade === 3) {
    return (
      <DragonDeliveryGame
        currentPet={currentPet}
        onComplete={onComplete}
        onBackToMap={onBackToMap}
      />
    );
  }

  if (mission.classGrade === 4) {
    return (
      <WizardPotionLabGame
        currentPet={currentPet}
        onComplete={onComplete}
        onBackToMap={onBackToMap}
      />
    );
  }

  if (mission.classGrade === 5) {
    return (
      <KingdomBuilderGame
        currentPet={currentPet}
        onComplete={onComplete}
        onBackToMap={onBackToMap}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 select-none p-1 sm:p-2">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToMap}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
        >
          <span>← Back to Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">{worldConfig.icon}</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            {worldConfig.name}
          </span>
          <span className="text-xs text-primary font-bold">· Class {mission.classGrade} Rescue Mission</span>
        </div>
      </div>

      {/* Main Interactive Stage Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Mission Title Header */}
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {mission.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {mission.instruction}
          </p>
        </div>

        {/* ==================================================== */}
        {/* MISSION 1: MAGIC STAR HUNT (MAGIC VILLAGE)            */}
        {/* ==================================================== */}
        {mission.id === 'c1_m1_village' && (
          <div className="space-y-4">
            {/* 2D Exploration Canvas */}
            <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-gradient-to-b from-emerald-100/70 via-emerald-50 to-green-100/50 dark:from-emerald-950/40 dark:to-green-950/20 border-2 border-emerald-200 dark:border-emerald-900/60 overflow-hidden shadow-inner p-4">
              {/* Village Scenery Decorations */}
              <div className="absolute top-4 left-6 text-3xl opacity-80">🌳</div>
              <div className="absolute top-8 right-12 text-3xl opacity-80">🌲</div>
              <div className="absolute bottom-6 left-10 text-2xl opacity-80">🌸</div>
              <div className="absolute bottom-8 right-8 text-2xl opacity-80">🌼</div>

              {/* Numbered Houses */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 sm:gap-12">
                {[2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleTouchHouse(num)}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md',
                      visitedHouse === num
                        ? num === 4
                          ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/60 ring-4 ring-emerald-300 animate-bounce'
                          : 'border-red-400 bg-red-50'
                        : 'border-emerald-300 bg-white dark:bg-gray-800'
                    )}
                  >
                    <span className="text-4xl">🏠</span>
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white mt-1">
                      House #{num}
                    </span>
                    {visitedHouse === num && num === 4 && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                        ⭐ King's Star!
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Floating Collectible Stars */}
              {[1, 2, 3].map((starId, idx) => {
                const positions = [
                  { left: '20%', top: '65%' },
                  { left: '80%', top: '60%' },
                  { left: '50%', top: '50%' },
                ];
                const isCollected = collectedStars.includes(starId);
                return (
                  !isCollected && (
                    <button
                      key={starId}
                      type="button"
                      onClick={() => handleCollectStar(starId)}
                      className="absolute text-3xl animate-bounce hover:scale-125 transition-transform cursor-pointer"
                      style={positions[idx]}
                    >
                      ⭐
                    </button>
                  )
                );
              })}

              {/* Player Avatar */}
              <motion.div
                animate={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              >
                <div className="text-3xl filter drop-shadow-md">🧒</div>
                <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full shadow-xs">
                  Explorer
                </span>
              </motion.div>
            </div>

            {/* Mobile / Touch D-Pad Controls */}
            <div className="flex flex-col items-center gap-1 sm:hidden pt-1">
              <button
                type="button"
                onClick={() => setPlayerPos((p) => ({ ...p, y: Math.max(15, p.y - 15) }))}
                className="w-12 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerPos((p) => ({ ...p, x: Math.max(10, p.x - 15) }))}
                  className="w-12 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerPos((p) => ({ ...p, y: Math.min(85, p.y + 15) }))}
                  className="w-12 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold"
                >
                  <ArrowDown className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerPos((p) => ({ ...p, x: Math.min(90, p.x + 15) }))}
                  className="w-12 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 2: MAGIC TRAIN (NUMBER RAILWAY)               */}
        {/* ==================================================== */}
        {mission.id === 'c1_m3_railway' && (
          <div className="rounded-3xl bg-[#FDF2F8] dark:bg-pink-950/20 border-2 border-pink-200 dark:border-pink-900/40 p-6 space-y-6 text-center">
            {/* Steam Train on Tracks */}
            <motion.div
              animate={trainDeparted ? { x: [0, 400], opacity: [1, 0] } : {}}
              transition={{ duration: 1.5 }}
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-card-dark rounded-2xl border border-pink-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-5xl">🚂</span>
                <span className="font-extrabold text-sm text-pink-700 dark:text-pink-300">
                  Royal Express
                </span>
              </div>

              {/* Passenger Carriages */}
              <div className="flex gap-2 p-3 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/30">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border transition-all',
                      idx < boardedCount
                        ? 'bg-pink-500 text-white border-pink-400 shadow-xs'
                        : 'border-dashed border-gray-300 dark:border-gray-700 text-gray-300'
                    )}
                  >
                    {idx < boardedCount ? '👤' : '?'}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Platform Travelers Waiting to Board */}
            {!trainDeparted && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-pink-900 dark:text-pink-300 uppercase tracking-wider block">
                  Click waiting travelers to board the train ({boardedCount} / 3 Boarded)
                </span>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  {Array.from({ length: 5 - boardedCount }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={handleBoardPassenger}
                      className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-pink-300 dark:border-pink-700 hover:scale-110 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span className="text-2xl">👧</span>
                      <span className="text-xs font-bold text-pink-700 dark:text-pink-300">
                        Board Passenger
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 3: WIZARD TOWER DOORS                         */}
        {/* ==================================================== */}
        {mission.id === 'c1_m4_tower' && (
          <div className="rounded-3xl bg-[#EEF2FF] dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/40 p-6 space-y-6 text-center">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
              Count the stars on each door. Find and open the door with 4 stars!
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[2, 3, 4, 5].map((starCount) => {
                const isTarget = starCount === 4;
                const isCurrent = selectedDoor === starCount;

                return (
                  <button
                    key={starCount}
                    type="button"
                    onClick={() => handleChooseDoor(starCount)}
                    className={cn(
                      'flex flex-col items-center p-5 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm',
                      isCurrent && isTarget && doorOpen
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-4 ring-emerald-300'
                        : 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-card-dark'
                    )}
                  >
                    <span className="text-4xl block mb-2">
                      {isCurrent && isTarget && doorOpen ? '🚪✨' : '🚪'}
                    </span>
                    <div className="flex flex-wrap justify-center gap-0.5 min-h-[24px]">
                      {Array.from({ length: starCount }).map((_, sIdx) => (
                        <span key={sIdx} className="text-base text-amber-500">
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 mt-2">
                      {starCount} Stars
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 4: MORE OR LESS FOREST                        */}
        {/* ==================================================== */}
        {mission.id === 'c1_m2_forest' && (
          <div className="rounded-3xl bg-[#ECFDF5] dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/40 p-6 space-y-6 text-center">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
              Which forest trail has MORE bunnies?
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Path A */}
              <button
                type="button"
                onClick={() => handleChoosePath('Path A')}
                className={cn(
                  'p-6 rounded-2xl border-2 text-center transition-all cursor-pointer hover:scale-105 shadow-sm',
                  selectedPath === 'Path A'
                    ? 'border-red-400 bg-red-50'
                    : 'border-emerald-200 bg-white dark:bg-card-dark'
                )}
              >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Forest Path A
                </span>
                <div className="flex justify-center gap-2 text-4xl mb-3">
                  <span>🐰</span>
                  <span>🐰</span>
                </div>
                <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200">
                  2 Rabbits
                </span>
              </button>

              {/* Path B */}
              <button
                type="button"
                onClick={() => handleChoosePath('Path B')}
                className={cn(
                  'p-6 rounded-2xl border-2 text-center transition-all cursor-pointer hover:scale-105 shadow-sm',
                  selectedPath === 'Path B'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-4 ring-emerald-300'
                    : 'border-emerald-200 bg-white dark:bg-card-dark'
                )}
              >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Forest Path B
                </span>
                <div className="flex justify-center gap-2 text-4xl mb-3">
                  <span>🐰</span>
                  <span>🐰</span>
                  <span>🐰</span>
                  <span>🐰</span>
                </div>
                <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
                  4 Rabbits (MORE!)
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 5: MAGIC BRIDGE (3 + 2 = 5)                   */}
        {/* ==================================================== */}
        {mission.id === 'c1_m5_bridge' && (
          <div className="rounded-3xl bg-[#EFF6FF] dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/40 p-6 space-y-6 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                Bridge requires 5 blocks. 3 are placed. Add 2 more!
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-white dark:bg-card-dark rounded-2xl border border-blue-200 dark:border-gray-700">
                {/* 3 Existing Stones */}
                {[1, 2, 3].map((num) => (
                  <div
                    key={`have_${num}`}
                    className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs"
                  >
                    🟦 {num}
                  </div>
                ))}

                {/* Added Stones */}
                {Array.from({ length: bridgeBlocksAdded }).map((_, idx) => (
                  <div
                    key={`added_${idx}`}
                    className="w-12 h-12 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs animate-bounce"
                  >
                    +1
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, 2 - bridgeBlocksAdded) }).map((_, idx) => (
                  <div
                    key={`empty_${idx}`}
                    className="w-12 h-12 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800 flex items-center justify-center text-xs text-blue-400"
                  >
                    ?
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 shadow-2xs">
              <div className="text-left font-extrabold text-primary text-base">
                Equation: 3 + {bridgeBlocksAdded} = {3 + bridgeBlocksAdded} / 5
              </div>

              <Button
                size="sm"
                variant="gradient"
                disabled={isResolved || bridgeBlocksAdded >= 2}
                onClick={handleAddBridgeBlock}
                leftIcon={<Hammer className="h-4 w-4" />}
                className="cursor-pointer shadow-xs"
              >
                + Add Bridge Stone ({bridgeBlocksAdded} / 2)
              </Button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 6: SHAPE HOUSE (TRIANGLE, SQUARE, RECT, CIR) */}
        {/* ==================================================== */}
        {mission.id === 'c1_m6_builder' && (
          <div className="rounded-3xl bg-[#F5F3FF] dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900/40 p-6 space-y-6 text-center">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider block">
              Click each shape to build the magical house!
            </span>

            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card-dark rounded-2xl border border-purple-200 dark:border-gray-700 min-h-[180px]">
              {/* Roof */}
              <div
                className={cn(
                  'w-32 h-14 flex items-center justify-center text-3xl transition-all',
                  placedShapes.roof ? 'text-amber-500 scale-110' : 'opacity-20'
                )}
              >
                🔺 Roof
              </div>

              {/* Main Body with Window and Door */}
              <div
                className={cn(
                  'w-44 h-32 rounded-2xl border-4 flex items-center justify-around p-3 transition-all',
                  placedShapes.body
                    ? 'border-purple-600 bg-purple-100/50 dark:bg-purple-950/40'
                    : 'border-dashed border-gray-300'
                )}
              >
                <div
                  className={cn(
                    'text-2xl transition-all',
                    placedShapes.window ? 'opacity-100 scale-110' : 'opacity-20'
                  )}
                >
                  🟡 Window
                </div>
                <div
                  className={cn(
                    'text-3xl transition-all',
                    placedShapes.door ? 'opacity-100 scale-110' : 'opacity-20'
                  )}
                >
                  🚪 Door
                </div>
              </div>
            </div>

            {/* Shape Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={placedShapes.roof}
                onClick={() => handlePlaceShape('roof')}
                className="px-4 py-2 rounded-xl border-2 border-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-purple-50"
              >
                <span>🔺 Triangle (Roof)</span>
              </button>
              <button
                type="button"
                disabled={placedShapes.body}
                onClick={() => handlePlaceShape('body')}
                className="px-4 py-2 rounded-xl border-2 border-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-purple-50"
              >
                <span>🟦 Square (Walls)</span>
              </button>
              <button
                type="button"
                disabled={placedShapes.window}
                onClick={() => handlePlaceShape('window')}
                className="px-4 py-2 rounded-xl border-2 border-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-purple-50"
              >
                <span>🟡 Circle (Window)</span>
              </button>
              <button
                type="button"
                disabled={placedShapes.door}
                onClick={() => handlePlaceShape('door')}
                className="px-4 py-2 rounded-xl border-2 border-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-purple-50"
              >
                <span>🚪 Rectangle (Door)</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 7: PATTERN GARDEN (⭐ 🔵 ⭐ 🔵 ?)            */}
        {/* ==================================================== */}
        {mission.id === 'c1_m7_garden' && (
          <div className="rounded-3xl bg-[#FEF3C7] dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/40 p-6 space-y-6 text-center">
            {/* Sequence Pathway */}
            <div className="flex flex-wrap items-center justify-center gap-3 p-5 bg-white dark:bg-card-dark rounded-2xl border border-amber-200 dark:border-gray-700">
              {['⭐', '🔵', '⭐', '🔵', selectedGardenItem ? selectedGardenItem : '?'].map(
                (item, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-xs',
                        idx < 4
                          ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40'
                          : selectedGardenItem
                          ? 'border-emerald-500 bg-emerald-50 animate-bounce'
                          : 'border-dashed border-amber-400 bg-amber-100/50 animate-pulse'
                      )}
                    >
                      {item}
                    </div>
                    {idx < 4 && <span className="text-amber-500 font-extrabold">→</span>}
                  </React.Fragment>
                )
              )}
            </div>

            {/* Item Options */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                Choose the correct magical garden flower / item
              </span>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {['⭐', '🔵', '🟢', '❤️'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={isResolved}
                    onClick={() => handleSelectGardenItem(opt)}
                    className="w-14 h-14 rounded-2xl border-2 border-amber-300 bg-white dark:bg-gray-800 text-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-xs"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MISSION 8: ROYAL CASTLE CORONATION TRIALS             */}
        {/* ==================================================== */}
        {mission.id === 'c1_m8_castle' && (
          <div className="rounded-3xl bg-[#FFFBEB] dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/80 p-6 space-y-6 text-center">
            <div className="text-5xl animate-bounce">👑</div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                The Royal Gates of Number Kingdom
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Complete the coronation trial {castleTrialIndex + 1} of 4 to unlock the Throne!
              </p>
            </div>

            {/* Rapid Trial Container */}
            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-amber-200 dark:border-gray-700 space-y-4">
              {castleTrialIndex === 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    Trial 1: Number Match — Touch number 5!
                  </span>
                  <div className="flex justify-center gap-3">
                    {[3, 5, 8].map((n) => (
                      <Button
                        key={n}
                        variant={n === 5 ? 'gradient' : 'outline'}
                        onClick={() => n === 5 && handleCastleTrialStep()}
                        className="cursor-pointer font-extrabold text-base"
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {castleTrialIndex === 1 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    Trial 2: Which has MORE? Touch the right group!
                  </span>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {}}
                      className="cursor-pointer"
                    >
                      ⭐ ⭐ (2)
                    </Button>
                    <Button
                      variant="gradient"
                      onClick={handleCastleTrialStep}
                      className="cursor-pointer"
                    >
                      ⭐⭐⭐⭐⭐ (5 - MORE!)
                    </Button>
                  </div>
                </div>
              )}

              {castleTrialIndex === 2 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    Trial 3: Addition Trial — 2 + 3 = ?
                  </span>
                  <div className="flex justify-center gap-3">
                    {[4, 5, 6].map((ans) => (
                      <Button
                        key={ans}
                        variant={ans === 5 ? 'gradient' : 'outline'}
                        onClick={() => ans === 5 && handleCastleTrialStep()}
                        className="cursor-pointer font-extrabold"
                      >
                        {ans}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {castleTrialIndex >= 3 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-600 block">
                    Final Trial: Coronation Crown Placement!
                  </span>
                  <Button
                    size="lg"
                    variant="gradient"
                    onClick={handleCastleTrialStep}
                    className="cursor-pointer shadow-md font-extrabold text-base px-8"
                  >
                    👑 Claim Number Master Crown!
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <AnimatePresence>
          {isResolved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'rounded-2xl p-4 border text-xs sm:text-sm space-y-2',
                isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              )}
            >
              <div className="flex items-center gap-2 font-bold">
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>Kingdom Quest Complete! +15 XP</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <span>Let's explore again!</span>
                  </>
                )}
              </div>

              <p className="font-medium text-gray-700 dark:text-gray-300">
                {feedbackMessage}
              </p>

              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="cursor-pointer shadow-xs"
                >
                  Continue Journey
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pet Companion Box */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
          <span className="text-3xl animate-pulse">{currentPet.avatar}</span>
          <div className="text-xs">
            <span className="font-bold text-gray-900 dark:text-white block">
              {currentPet.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {isResolved
                ? isSuccess
                  ? 'Incredible teamwork, Explorer! The Kingdom celebrates your discovery!'
                  : "Don't worry, Young Explorer! Let's count together!"
                : currentPet.greeting}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
