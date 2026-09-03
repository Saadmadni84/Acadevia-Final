import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PetConfig } from '../types';
import { cn } from '@/lib/utils';

interface NumberBridgeGameProps {
  currentPet: PetConfig;
  onComplete: (isSuccess: boolean, timeSpentSec: number) => void;
  onBackToMap: () => void;
}

interface BridgeLevel {
  id: number;
  title: string;
  instruction: string;
  mathExplanation: string;
  concept: string;
  existingStones: number[];
  targetSequence: number[]; // Full correct sequence
  missingIndexes: number[]; // Indices in targetSequence that need placing
  availableStones: number[]; // Stones player can pick from
  companionHint: string;
}

const BRIDGE_LEVELS: BridgeLevel[] = [
  {
    id: 1,
    title: 'Level 1: Ascending Step Bridge',
    instruction: 'Complete the stone walkway in counting order (2, 4, 6, 8, 10, 12).',
    mathExplanation: 'Skip-counting by 2s: 2, 4, 6, 8, 10, 12! The bridge is secure!',
    concept: 'Skip Counting by 2s',
    existingStones: [2, 4, 8, 12],
    targetSequence: [2, 4, 6, 8, 10, 12],
    missingIndexes: [2, 4], // indices for 6 and 10
    availableStones: [6, 10, 5, 9, 14],
    companionHint: 'Look at the gap between 4 and 8. What comes in between when counting by 2s?',
  },
  {
    id: 2,
    title: 'Level 2: Place Value Archway',
    instruction: 'Arrange tens and ones stones from smallest to largest to balance the royal arch.',
    mathExplanation: 'Ordered 15 < 28 < 42 < 59 < 73! The archway locks into place!',
    concept: 'Number Comparison & Order',
    existingStones: [15, 42, 73],
    targetSequence: [15, 28, 42, 59, 73],
    missingIndexes: [1, 3], // indices for 28 and 59
    availableStones: [28, 59, 31, 80, 12],
    companionHint: 'Find a stone greater than 15 but less than 42, and another between 42 and 73!',
  },
  {
    id: 3,
    title: 'Level 3: Equal Grouping Keystone',
    instruction: 'Place stones in repeated additions of 5 to span the river gorge (5, 10, 15, 20, 25).',
    mathExplanation: '4 groups of 5 make 20, and 5 groups of 5 make 25! Multiplication foundations complete!',
    concept: 'Repeated Addition & 5s Sequence',
    existingStones: [5, 10, 20],
    targetSequence: [5, 10, 15, 20, 25],
    missingIndexes: [2, 4], // indices for 15 and 25
    availableStones: [15, 25, 18, 30, 8],
    companionHint: 'Add 5 each time: 5 + 5 = 10, 10 + 5 = 15, 15 + 5 = 20, 20 + 5 = 25!',
  },
];

export const NumberBridgeGame: React.FC<NumberBridgeGameProps> = ({
  currentPet,
  onComplete,
  onBackToMap,
}) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [placedStones, setPlacedStones] = useState<Record<number, number>>({}); // index -> stoneValue
  const [selectedStone, setSelectedStone] = useState<number | null>(null);
  const [isLevelSuccess, setIsLevelSuccess] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [characterCrossing, setCharacterCrossing] = useState(false);
  const [startTime] = useState(Date.now());

  const currentLevel = BRIDGE_LEVELS[levelIndex];

  const handleSelectInventoryStone = (stone: number) => {
    setSelectedStone(stone);
    setFeedback(`Selected stone [${stone}]. Now click an empty glowing slot on the bridge.`);
  };

  const handlePlaceInSlot = (slotIdx: number) => {
    if (selectedStone === null) {
      setFeedback('Select a stone from your toolbelt first, then place it in the gap!');
      return;
    }

    const nextPlaced = { ...placedStones, [slotIdx]: selectedStone };
    setPlacedStones(nextPlaced);
    setSelectedStone(null);

    // Check if all missing slots are filled
    const allFilled = currentLevel.missingIndexes.every(
      (idx) => nextPlaced[idx] !== undefined
    );

    if (allFilled) {
      // Validate correctness
      const isAllCorrect = currentLevel.missingIndexes.every(
        (idx) => nextPlaced[idx] === currentLevel.targetSequence[idx]
      );

      if (isAllCorrect) {
        setIsLevelSuccess(true);
        setCharacterCrossing(true);
        setFeedback(currentLevel.mathExplanation);
      } else {
        setFeedback('The bridge is still wobbly! Check the numbers and try replacing the misplaced stones.');
      }
    }
  };

  const handleRemoveStone = (slotIdx: number) => {
    if (isLevelSuccess) return;
    const next = { ...placedStones };
    delete next[slotIdx];
    setPlacedStones(next);
    setIsLevelSuccess(false);
    setFeedback('Stone returned to your toolbelt. Try another one.');
  };

  const handleNextLevelOrFinish = () => {
    if (levelIndex < BRIDGE_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
      setPlacedStones({});
      setSelectedStone(null);
      setIsLevelSuccess(false);
      setCharacterCrossing(false);
      setFeedback('');
    } else {
      const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      onComplete(true, timeSpent);
    }
  };

  // Stones currently available to place (exclude already placed)
  const remainingInventory = currentLevel.availableStones.filter(
    (stone) => !Object.values(placedStones).includes(stone)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 select-none p-1 sm:p-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToMap}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
        >
          <span>← Back to Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">🌉</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Number Bridge
          </span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
            Class 2 Math Adventure
          </span>
        </div>
      </div>

      {/* Main Game Stage */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Mission Info & Level Indicators */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                {currentLevel.concept}
              </span>
              <span className="text-xs text-gray-400">
                · Level {levelIndex + 1} of {BRIDGE_LEVELS.length}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {currentLevel.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {currentLevel.instruction}
            </p>
          </div>

          <div className="flex gap-1.5">
            {BRIDGE_LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={cn(
                  'w-8 h-2 rounded-full transition-all',
                  idx < levelIndex
                    ? 'bg-emerald-500'
                    : idx === levelIndex
                    ? 'bg-primary w-12'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* 2D Interactive Bridge Canvas */}
        <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-gradient-to-b from-sky-200/80 via-blue-100/50 to-teal-200/60 dark:from-slate-900 dark:via-blue-950/40 dark:to-teal-950/30 border-2 border-blue-200 dark:border-blue-900/60 overflow-hidden shadow-inner p-4 flex flex-col justify-between">
          {/* Environment Elements */}
          <div className="absolute top-4 left-6 text-3xl">☁️</div>
          <div className="absolute top-6 right-12 text-3xl">☁️</div>
          <div className="absolute top-12 left-1/3 text-2xl opacity-80">🦅</div>
          <div className="absolute bottom-3 left-4 text-3xl">🌿</div>
          <div className="absolute bottom-3 right-4 text-3xl">🌿</div>
          <div className="absolute bottom-1 w-full text-center text-xs font-bold text-blue-600/70 tracking-widest uppercase">
            ≈ ≈ ≈ Flowing Royal River ≈ ≈ ≈
          </div>

          {/* Player Avatar on Left Cliff */}
          <motion.div
            animate={
              characterCrossing
                ? { x: ['0%', '100%'], y: [0, -10, 0, -10, 0] }
                : { y: [0, -5, 0] }
            }
            transition={
              characterCrossing
                ? { duration: 2.2, ease: 'easeInOut' }
                : { repeat: Infinity, duration: 2 }
            }
            className="absolute left-6 top-24 sm:top-28 z-20 flex flex-col items-center"
          >
            <span className="text-4xl filter drop-shadow-md">🧒</span>
            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full shadow-xs mt-1">
              Builder
            </span>
          </motion.div>

          {/* Goal Flag on Right Cliff */}
          <div className="absolute right-6 top-24 sm:top-28 z-10 flex flex-col items-center">
            <span className="text-4xl animate-bounce">🚩</span>
            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs mt-1">
              Safe Haven
            </span>
          </div>

          {/* The Modular Bridge Span */}
          <div className="my-auto mx-auto w-full max-w-2xl px-4 z-10">
            <div className="flex items-center justify-center gap-2 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-stone-900/40 backdrop-blur-xs border-2 border-stone-600/50 shadow-lg">
              {currentLevel.targetSequence.map((correctVal, idx) => {
                const isFixed = currentLevel.existingStones.includes(correctVal);
                const placedVal = placedStones[idx];
                const isMissingSlot = currentLevel.missingIndexes.includes(idx);

                if (isFixed) {
                  return (
                    <div
                      key={idx}
                      className="w-12 h-16 sm:w-16 sm:h-20 rounded-2xl bg-gradient-to-b from-stone-200 to-stone-400 dark:from-stone-700 dark:to-stone-900 border-2 border-stone-400 dark:border-stone-600 flex flex-col items-center justify-center shadow-md text-stone-900 dark:text-white"
                    >
                      <span className="text-[10px] uppercase font-bold text-stone-500">Pillar</span>
                      <span className="text-lg sm:text-2xl font-black">{correctVal}</span>
                    </div>
                  );
                }

                if (placedVal !== undefined) {
                  const isCorrect = placedVal === correctVal;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleRemoveStone(idx)}
                      className={cn(
                        'w-12 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center shadow-md cursor-pointer transition-all',
                        isCorrect
                          ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400'
                          : 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 border-amber-400 animate-pulse'
                      )}
                    >
                      <span className="text-[9px] uppercase font-bold">{isCorrect ? 'Locked' : 'Click to Remove'}</span>
                      <span className="text-lg sm:text-2xl font-black">{placedVal}</span>
                    </motion.button>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePlaceInSlot(idx)}
                    className={cn(
                      'w-12 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer shadow-inner',
                      selectedStone !== null
                        ? 'border-emerald-400 bg-emerald-100/40 dark:bg-emerald-950/40 text-emerald-600 animate-bounce'
                        : 'border-white/60 bg-white/20 dark:bg-gray-800/40 text-white/70 hover:bg-white/30'
                    )}
                  >
                    <Hammer className="h-4 w-4 mb-1" />
                    <span className="text-[10px] font-bold">Slot #{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Toolbelt Inventory */}
          <div className="z-10 bg-white/90 dark:bg-card-dark/95 backdrop-blur-md rounded-2xl p-3 border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧰 Your Stone Toolbelt:</span>
                <span className="text-[11px] font-normal text-gray-500">
                  (Pick a stone, then click an empty bridge slot)
                </span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {remainingInventory.map((stone) => (
                  <button
                    key={stone}
                    type="button"
                    onClick={() => handleSelectInventoryStone(stone)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-base font-black border-2 transition-all cursor-pointer shadow-xs',
                      selectedStone === stone
                        ? 'border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-200 scale-110'
                        : 'border-gray-300 dark:border-gray-600 bg-stone-100 dark:bg-gray-800 text-stone-900 dark:text-white hover:border-emerald-400 hover:scale-105'
                    )}
                  >
                    🪨 {stone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Companion Hint & Feedback */}
        <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{currentPet.avatar}</span>
            <div>
              <span className="text-xs font-bold text-primary block">{currentPet.name}'s Guidance:</span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium">
                {feedback || currentLevel.companionHint}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isLevelSuccess && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleNextLevelOrFinish}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="shadow-md cursor-pointer shrink-0 font-bold"
                >
                  {levelIndex < BRIDGE_LEVELS.length - 1 ? 'Next Level →' : 'Complete Quest 🏆'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
