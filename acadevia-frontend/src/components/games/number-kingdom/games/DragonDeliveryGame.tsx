import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Package, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PetConfig } from '../types';
import { cn } from '@/lib/utils';

interface DragonDeliveryGameProps {
  currentPet: PetConfig;
  onComplete: (isSuccess: boolean, timeSpentSec: number) => void;
  onBackToMap: () => void;
}

interface DeliveryOrder {
  buildingId: string;
  buildingName: string;
  buildingIcon: string;
  itemType: string;
  itemIcon: string;
  boxCount: number;
  itemsPerBox: number;
  totalRequired: number; // boxCount * itemsPerBox
}

interface DeliveryLevel {
  id: number;
  title: string;
  instruction: string;
  mathExplanation: string;
  concept: string;
  order: DeliveryOrder;
  companionHint: string;
}

const DELIVERY_LEVELS: DeliveryLevel[] = [
  {
    id: 1,
    title: 'Level 1: Potion Guild Crystal Crates',
    instruction: 'Load the Dragon Cart with 4 crates containing 6 Mana Crystals each.',
    mathExplanation: '4 crates × 6 crystals = 24 Mana Crystals delivered safely!',
    concept: 'Equal Grouping & Multiplication (4 × 6)',
    order: {
      buildingId: 'guild',
      buildingName: 'Healer Potion Guild',
      buildingIcon: '🏰',
      itemType: 'Mana Crystal',
      itemIcon: '💎',
      boxCount: 4,
      itemsPerBox: 6,
      totalRequired: 24,
    },
    companionHint: 'Each of the 4 crates must hold 6 crystals. Calculate 4 × 6 to know your cargo total!',
  },
  {
    id: 2,
    title: 'Level 2: Bakery Golden Grain Sacks',
    instruction: 'Load 6 sacks of enchanted flour with 8 bags each for the Royal Bakery.',
    mathExplanation: '6 sacks × 8 bags = 48 bags delivered to the bakers!',
    concept: 'Multiplication by 8 (6 × 8)',
    order: {
      buildingId: 'bakery',
      buildingName: 'Royal Village Bakery',
      buildingIcon: '🥖',
      itemType: 'Grain Sack',
      itemIcon: '🌾',
      boxCount: 6,
      itemsPerBox: 8,
      totalRequired: 48,
    },
    companionHint: '6 equal groups of 8: count by 8s (8, 16, 24, 32, 40, 48)!',
  },
  {
    id: 3,
    title: 'Level 3: Equal Sharing for 4 Wizard Towers',
    instruction: 'Evenly distribute 36 Star Orbs into 4 delivery chests (36 ÷ 4).',
    mathExplanation: '36 orbs split equally into 4 chests = 9 Star Orbs per chest! (36 ÷ 4 = 9)',
    concept: 'Division & Equal Sharing (36 ÷ 4)',
    order: {
      buildingId: 'towers',
      buildingName: 'Astral Observatory',
      buildingIcon: '🔭',
      itemType: 'Star Orb',
      itemIcon: '🔮',
      boxCount: 4,
      itemsPerBox: 9,
      totalRequired: 36,
    },
    companionHint: 'Divide 36 by 4. How many orbs belong in each of the 4 chests so each has the exact same amount?',
  },
];

export const DragonDeliveryGame: React.FC<DragonDeliveryGameProps> = ({
  currentPet,
  onComplete,
  onBackToMap,
}) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [cartQuantities, setCartQuantities] = useState<number[]>([]); // quantity per box
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime] = useState(Date.now());

  const currentLevel = DELIVERY_LEVELS[levelIndex];

  // Initialize cart boxes when level changes
  React.useEffect(() => {
    setCartQuantities(new Array(currentLevel.order.boxCount).fill(0));
    setIsDelivered(false);
    setDeliverySuccess(false);
    setFeedback('');
  }, [levelIndex, currentLevel.order.boxCount]);

  const handleAdjustBox = (boxIdx: number, delta: number) => {
    if (deliverySuccess) return;
    setCartQuantities((prev) => {
      const next = [...prev];
      next[boxIdx] = Math.max(0, Math.min(15, (next[boxIdx] || 0) + delta));
      return next;
    });
    setIsDelivered(false);
  };

  const handleQuickFillAll = (count: number) => {
    if (deliverySuccess) return;
    setCartQuantities(new Array(currentLevel.order.boxCount).fill(count));
    setIsDelivered(false);
  };

  const currentTotalLoaded = cartQuantities.reduce((a, b) => a + b, 0);

  const handleDispatchDragon = () => {
    const isAllEqual = cartQuantities.every(
      (qty) => qty === currentLevel.order.itemsPerBox
    );
    const isTotalCorrect = currentTotalLoaded === currentLevel.order.totalRequired;

    setIsDelivered(true);

    if (isAllEqual && isTotalCorrect) {
      setDeliverySuccess(true);
      setFeedback(currentLevel.mathExplanation);
    } else if (isTotalCorrect && !isAllEqual) {
      setFeedback(
        `Total cargo is ${currentTotalLoaded}, but the boxes are not equal! Every box must have exactly ${currentLevel.order.itemsPerBox} items.`
      );
    } else {
      setFeedback(
        `Current total is ${currentTotalLoaded} ${currentLevel.order.itemType}s. The destination requires ${currentLevel.order.totalRequired} (${currentLevel.order.boxCount} boxes × ${currentLevel.order.itemsPerBox}). Adjust your cargo!`
      );
    }
  };

  const handleNextLevelOrFinish = () => {
    if (levelIndex < DELIVERY_LEVELS.length - 1) {
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
          <span className="text-xl">🐉</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Dragon Delivery
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
            Class 3 Math Adventure
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
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {currentLevel.concept}
              </span>
              <span className="text-xs text-gray-400">
                · Level {levelIndex + 1} of {DELIVERY_LEVELS.length}
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
            {DELIVERY_LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={cn(
                  'w-8 h-2 rounded-full transition-all',
                  idx < levelIndex
                    ? 'bg-emerald-500'
                    : idx === levelIndex
                    ? 'bg-amber-500 w-12'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* 2D Interactive Dragon Cargo Stage */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-amber-100/70 via-orange-50 to-amber-100/50 dark:from-slate-900 dark:via-amber-950/30 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-900/60 overflow-hidden shadow-inner p-5 space-y-6">
          {/* Destination Manifest */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 dark:bg-card-dark/90 p-4 rounded-2xl border border-amber-200 dark:border-gray-700 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentLevel.order.buildingIcon}</span>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <span className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  {currentLevel.order.buildingName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200">
                Target: {currentLevel.order.boxCount} Boxes × {currentLevel.order.itemsPerBox} {currentLevel.order.itemType}s = <span className="text-base text-amber-600 dark:text-amber-400 font-extrabold">{currentLevel.order.totalRequired} Total</span>
              </div>
              <div className={cn(
                'px-3 py-1.5 rounded-xl border font-extrabold',
                currentTotalLoaded === currentLevel.order.totalRequired
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300'
              )}>
                Loaded: {currentTotalLoaded} / {currentLevel.order.totalRequired}
              </div>
            </div>
          </div>

          {/* Dragon Delivery Cart & Boxes */}
          <div className="p-4 rounded-3xl bg-amber-950/10 dark:bg-black/30 border-2 border-amber-300/60 dark:border-amber-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-bounce">🐲🛒</span>
                <span className="font-extrabold text-xs sm:text-sm text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  Dragon Cargo Bay
                </span>
              </div>

              {/* Quick Fill Helper */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500">Quick Fill All:</span>
                {[currentLevel.order.itemsPerBox, Math.max(1, currentLevel.order.itemsPerBox - 2), currentLevel.order.itemsPerBox + 2].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleQuickFillAll(cnt)}
                    className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-white dark:bg-gray-800 border border-amber-300 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {cnt} ea
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Delivery Crates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cartQuantities.map((qty, idx) => {
                const isTarget = qty === currentLevel.order.itemsPerBox;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 rounded-2xl border-2 bg-white dark:bg-card-dark flex flex-col items-center justify-between gap-2 shadow-xs transition-all',
                      isTarget
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-300'
                        : qty > 0
                        ? 'border-amber-400 bg-amber-50/30'
                        : 'border-dashed border-gray-300 dark:border-gray-700'
                    )}
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Box #{idx + 1}
                    </span>

                    {/* Visual Item Stack */}
                    <div className="flex flex-wrap justify-center gap-0.5 min-h-[36px] items-center p-1 bg-gray-50 dark:bg-gray-800 rounded-xl w-full">
                      {Array.from({ length: Math.min(qty, 12) }).map((_, i) => (
                        <span key={i} className="text-sm scale-90">
                          {currentLevel.order.itemIcon}
                        </span>
                      ))}
                      {qty > 12 && <span className="text-[10px] font-bold">+{qty - 12}</span>}
                      {qty === 0 && <span className="text-xs text-gray-300">Empty</span>}
                    </div>

                    <span className="text-base font-black text-gray-900 dark:text-white">
                      {qty} {currentLevel.order.itemType}s
                    </span>

                    {/* Box Increment Controls */}
                    <div className="flex items-center gap-1 w-full">
                      <button
                        type="button"
                        onClick={() => handleAdjustBox(idx, -1)}
                        className="flex-1 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 text-gray-700 dark:text-gray-300 hover:text-red-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustBox(idx, 1)}
                        className="flex-1 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Dispatch Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Formula: <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{currentLevel.order.boxCount} boxes × {currentLevel.order.itemsPerBox} per box = {currentLevel.order.totalRequired} items</span>
            </div>

            <Button
              size="lg"
              variant="gradient"
              onClick={handleDispatchDragon}
              disabled={deliverySuccess}
              className="shadow-md cursor-pointer font-bold px-8"
            >
              🚀 Dispatch Dragon Delivery!
            </Button>
          </div>
        </div>

        {/* Dynamic Companion Hint & Feedback */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{currentPet.avatar}</span>
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                {currentPet.name}'s Cart Guidance:
              </span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium">
                {feedback || currentLevel.companionHint}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {deliverySuccess && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleNextLevelOrFinish}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="shadow-md cursor-pointer shrink-0 font-bold"
                >
                  {levelIndex < DELIVERY_LEVELS.length - 1 ? 'Next Order →' : 'Complete Delivery Quest 🏆'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
