import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PetConfig } from '../types';
import { cn } from '@/lib/utils';

interface WizardPotionLabGameProps {
  currentPet: PetConfig;
  onComplete: (isSuccess: boolean, timeSpentSec: number) => void;
  onBackToMap: () => void;
}

interface LabLevel {
  id: number;
  title: string;
  instruction: string;
  mathExplanation: string;
  concept: string;
  totalLiquidMl: number;
  bottleCount: number;
  targetMlPerBottle: number; // totalLiquidMl / bottleCount
  dispenserDoses: number[]; // e.g., [100, 10, 1] ml buttons
  companionHint: string;
}

const LAB_LEVELS: LabLevel[] = [
  {
    id: 1,
    title: 'Level 1: Luminescent Elixir of Sight',
    instruction: 'Distribute 864 ml of glowing elixir equally into 8 crystal vials.',
    mathExplanation: '864 ml ÷ 8 vials = exactly 108 ml per vial! The elixir glows with pure light!',
    concept: '3-Digit Division (864 ÷ 8)',
    totalLiquidMl: 864,
    bottleCount: 8,
    targetMlPerBottle: 108,
    dispenserDoses: [100, 50, 10, 1],
    companionHint: 'Divide 800 ÷ 8 = 100 ml, and 64 ÷ 8 = 8 ml. Add them together: 100 + 8 = 108 ml per vial!',
  },
  {
    id: 2,
    title: 'Level 2: Phoenix Feather Essence',
    instruction: 'Distribute 750 ml of Phoenix essence equally into 6 enchanted flask cauldrons.',
    mathExplanation: '750 ml ÷ 6 flasks = 125 ml per flask! Phoenix flames ignite with warmth!',
    concept: 'Multi-digit Division & Measurement (750 ÷ 6)',
    totalLiquidMl: 750,
    bottleCount: 6,
    targetMlPerBottle: 125,
    dispenserDoses: [100, 25, 10, 5],
    companionHint: '6 × 100 = 600 ml. Remaining 150 ml ÷ 6 = 25 ml. So 100 + 25 = 125 ml each!',
  },
  {
    id: 3,
    title: 'Level 3: Astral Moonwater Fraction Brew',
    instruction: 'Distribute 960 ml of Moonwater equally across 4 wizard flasks, each needing 3/4 capacity (240 ml).',
    mathExplanation: '960 ml ÷ 4 flasks = 240 ml per flask! The celestial moon brew is complete!',
    concept: 'Division & Fraction Capacity (960 ÷ 4)',
    totalLiquidMl: 960,
    bottleCount: 4,
    targetMlPerBottle: 240,
    dispenserDoses: [100, 50, 20, 10],
    companionHint: '960 split 4 ways: 800 ÷ 4 = 200, and 160 ÷ 4 = 40. 200 + 40 = 240 ml per flask!',
  },
];

export const WizardPotionLabGame: React.FC<WizardPotionLabGameProps> = ({
  currentPet,
  onComplete,
  onBackToMap,
}) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [bottleLevels, setBottleLevels] = useState<number[]>([]);
  const [activeBottleIndex, setActiveBottleIndex] = useState<number>(0);
  const [isBrewComplete, setIsBrewComplete] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime] = useState(Date.now());

  const currentLevel = LAB_LEVELS[levelIndex];

  // Initialize bottles when level changes
  React.useEffect(() => {
    setBottleLevels(new Array(currentLevel.bottleCount).fill(0));
    setActiveBottleIndex(0);
    setIsBrewComplete(false);
    setFeedback('');
  }, [levelIndex, currentLevel.bottleCount]);

  const totalLiquidPoured = bottleLevels.reduce((a, b) => a + b, 0);
  const remainingInCauldron = Math.max(0, currentLevel.totalLiquidMl - totalLiquidPoured);

  const handlePourDose = (dose: number) => {
    if (isBrewComplete) return;

    if (remainingInCauldron < dose) {
      setFeedback(`Not enough potion left in the main cauldron to pour ${dose} ml!`);
      return;
    }

    setBottleLevels((prev) => {
      const next = [...prev];
      next[activeBottleIndex] = (next[activeBottleIndex] || 0) + dose;
      return next;
    });
  };

  const handleResetActiveBottle = () => {
    if (isBrewComplete) return;
    setBottleLevels((prev) => {
      const next = [...prev];
      next[activeBottleIndex] = 0;
      return next;
    });
  };

  const handleEqualizeAllBottles = (targetVal: number) => {
    if (isBrewComplete) return;
    if (targetVal * currentLevel.bottleCount > currentLevel.totalLiquidMl) {
      setFeedback(`That would exceed the ${currentLevel.totalLiquidMl} ml total!`);
      return;
    }
    setBottleLevels(new Array(currentLevel.bottleCount).fill(targetVal));
  };

  const handleBrewPotion = () => {
    const isAllEqual = bottleLevels.every(
      (lvl) => lvl === currentLevel.targetMlPerBottle
    );
    const isExactTotal = totalLiquidPoured === currentLevel.totalLiquidMl;

    if (isAllEqual && isExactTotal) {
      setIsBrewComplete(true);
      setFeedback(currentLevel.mathExplanation);
    } else if (isExactTotal && !isAllEqual) {
      setFeedback(
        `All ${currentLevel.totalLiquidMl} ml was poured, but the bottles have uneven measurements! Every vial must contain exactly ${currentLevel.targetMlPerBottle} ml.`
      );
    } else {
      setFeedback(
        `Current vials hold ${totalLiquidPoured} ml total. We need all ${currentLevel.totalLiquidMl} ml distributed equally (${currentLevel.targetMlPerBottle} ml each).`
      );
    }
  };

  const handleNextLevelOrFinish = () => {
    if (levelIndex < LAB_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
    } else {
      const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      onComplete(true, timeSpent);
    }
  };

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
          <span className="text-xl">🧪</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Wizard's Potion Lab
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
            Class 4 Math Adventure
          </span>
        </div>
      </div>

      {/* Main Game Stage */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Mission Info Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {currentLevel.concept}
              </span>
              <span className="text-xs text-gray-400">
                · Level {levelIndex + 1} of {LAB_LEVELS.length}
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
            {LAB_LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={cn(
                  'w-8 h-2 rounded-full transition-all',
                  idx < levelIndex
                    ? 'bg-emerald-500'
                    : idx === levelIndex
                    ? 'bg-indigo-500 w-12'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* 2D Potion Laboratory Canvas */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500/30 overflow-hidden shadow-2xl p-6 text-white space-y-6">
          {/* Main Cauldron & Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-indigo-400/20 backdrop-blur-md">
            {/* Master Cauldron */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-5xl animate-pulse">⚗️</span>
                <Sparkles className="h-4 w-4 text-amber-300 absolute -top-1 -right-1 animate-spin" />
              </div>
              <div>
                <span className="text-xs text-indigo-300 uppercase tracking-widest font-bold block">
                  Master Cauldron Volume
                </span>
                <span className="text-2xl font-black text-amber-300">
                  {remainingInCauldron} ml{' '}
                  <span className="text-xs font-normal text-gray-400">/ {currentLevel.totalLiquidMl} ml</span>
                </span>
              </div>
            </div>

            {/* Target Formula Badge */}
            <div className="text-right">
              <span className="text-xs text-indigo-300 uppercase tracking-widest font-bold block">
                Target Allocation
              </span>
              <div className="font-mono text-sm font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                {currentLevel.totalLiquidMl} ml ÷ {currentLevel.bottleCount} vials = <span className="text-lg font-black text-white">{currentLevel.targetMlPerBottle} ml</span> each
              </div>
            </div>
          </div>

          {/* Vials Rack on Laboratory Table */}
          <div className="p-4 rounded-3xl bg-black/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
              <span>SELECT A VIAL TO POUR INTO:</span>
              <div className="flex items-center gap-2">
                <span>Quick equalize:</span>
                {[currentLevel.targetMlPerBottle, Math.max(0, currentLevel.targetMlPerBottle - 10), currentLevel.targetMlPerBottle + 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleEqualizeAllBottles(val)}
                    className="px-2 py-0.5 rounded bg-indigo-900/80 hover:bg-indigo-700 text-[10px] text-white font-mono cursor-pointer"
                  >
                    {val} ml
                  </button>
                ))}
              </div>
            </div>

            {/* The Bottles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {bottleLevels.map((lvl, idx) => {
                const isActive = activeBottleIndex === idx;
                const isTarget = lvl === currentLevel.targetMlPerBottle;
                const fillPercent = Math.min(100, (lvl / (currentLevel.targetMlPerBottle * 1.3)) * 100);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveBottleIndex(idx)}
                    className={cn(
                      'p-3 rounded-2xl border-2 flex flex-col items-center justify-between gap-2 transition-all cursor-pointer relative overflow-hidden',
                      isActive
                        ? 'border-indigo-400 bg-indigo-900/50 ring-2 ring-indigo-300 scale-105 shadow-lg'
                        : 'border-indigo-900/60 bg-black/30 hover:border-indigo-500/50'
                    )}
                  >
                    <span className="text-[10px] font-bold text-indigo-300 uppercase">
                      Vial #{idx + 1}
                    </span>

                    {/* Flask graphic with liquid fill level */}
                    <div className="w-12 h-20 rounded-b-xl rounded-t-sm border-2 border-indigo-300/40 bg-indigo-950/60 relative overflow-hidden flex items-end justify-center">
                      <motion.div
                        animate={{ height: `${fillPercent}%` }}
                        transition={{ type: 'spring', damping: 15 }}
                        className={cn(
                          'w-full transition-colors',
                          isTarget
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : lvl > currentLevel.targetMlPerBottle
                            ? 'bg-gradient-to-t from-red-600 to-amber-500'
                            : 'bg-gradient-to-t from-indigo-600 to-purple-400'
                        )}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-white drop-shadow-md">
                        {lvl} ml
                      </span>
                    </div>

                    <span className={cn(
                      'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full',
                      isTarget ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400'
                    )}>
                      {isTarget ? '✓ Matched' : `${lvl} ml`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Liquid Dispenser Dosing Controls */}
          <div className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200">
                Dispense into Vial #{activeBottleIndex + 1}:
              </span>
            </div>

            {/* Dose Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {currentLevel.dispenserDoses.map((dose) => (
                <Button
                  key={dose}
                  size="sm"
                  variant="outline"
                  onClick={() => handlePourDose(dose)}
                  className="bg-indigo-800/60 hover:bg-indigo-700 text-white border-indigo-400/40 font-mono font-black text-xs cursor-pointer"
                >
                  +{dose} ml
                </Button>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={handleResetActiveBottle}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/30 text-xs cursor-pointer"
              >
                Empty Vial
              </Button>
            </div>
          </div>

          {/* Complete Brew CTA */}
          <div className="flex justify-end pt-1">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleBrewPotion}
              disabled={isBrewComplete}
              className="shadow-lg cursor-pointer font-bold px-8 text-base"
            >
              ✨ Enchant & Seal Potion Vials
            </Button>
          </div>
        </div>

        {/* Dynamic Companion Hint & Feedback */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-300/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{currentPet.avatar}</span>
            <div>
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 block">
                {currentPet.name}'s Alchemical Notes:
              </span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium">
                {feedback || currentLevel.companionHint}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isBrewComplete && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleNextLevelOrFinish}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="shadow-md cursor-pointer shrink-0 font-bold"
                >
                  {levelIndex < LAB_LEVELS.length - 1 ? 'Next Potion →' : 'Complete Potion Quest 🏆'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
