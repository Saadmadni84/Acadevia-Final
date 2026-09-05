import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Boxes, Award, Sparkles, RotateCcw, Check, Flame, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface FractionVial {
  id: string;
  label: string;
  num: number;
  den: number;
  val: number;
  color: string;
}

const FRACTION_VIALS: FractionVial[] = [
  { id: '1/2', label: '1/2', num: 1, den: 2, val: 0.5, color: 'from-blue-500 to-cyan-500' },
  { id: '1/3', label: '1/3', num: 1, den: 3, val: 1 / 3, color: 'from-amber-500 to-yellow-500' },
  { id: '1/4', label: '1/4', num: 1, den: 4, val: 0.25, color: 'from-emerald-500 to-green-600' },
  { id: '2/3', label: '2/3', num: 2, den: 3, val: 2 / 3, color: 'from-purple-500 to-indigo-600' },
  { id: '3/4', label: '3/4', num: 3, den: 4, val: 0.75, color: 'from-rose-500 to-pink-600' },
  { id: '1/6', label: '1/6', num: 1, den: 6, val: 1 / 6, color: 'from-teal-500 to-emerald-600' },
];

interface ForgeRecipe {
  item: string;
  targetFraction: string;
  targetDecimal: number;
  targetNum: number;
  targetDen: number;
  description: string;
  tier: string;
  points: number;
}

const RECIPES: ForgeRecipe[] = [
  { item: 'Bronze Ingot', targetFraction: '3/4', targetDecimal: 0.75, targetNum: 3, targetDen: 4, tier: 'Tier 1', description: 'Classic alloy of copper and tin. Combine fractions to reach 3/4 vessel capacity.', points: 120 },
  { item: 'Iron Broadsword', targetFraction: '5/6', targetDecimal: 5 / 6, targetNum: 5, targetDen: 6, tier: 'Tier 2', description: 'Combine fractions with different denominators (e.g. 1/2 and 1/3) to reach 5/6.', points: 150 },
  { item: 'Damascus Steel', targetFraction: '1 1/4 (5/4)', targetDecimal: 1.25, targetNum: 5, targetDen: 4, tier: 'Tier 3', description: 'Heavy mixed fraction requiring crucible expansion to reach 5/4 capacity.', points: 180 },
  { item: 'Titanium Shield', targetFraction: '7/6 (1 1/6)', targetDecimal: 7 / 6, targetNum: 7, targetDen: 6, tier: 'Tier 4', description: 'Precision aerospace alloy. Combine 3/4 and 5/12 or 2/3 and 1/2.', points: 220 },
  { item: 'Celestial Anvil', targetFraction: '3/2 (1 1/2)', targetDecimal: 1.5, targetNum: 3, targetDen: 2, tier: 'Tier 5', description: 'Legendary grandmaster alloy. Forge exactly 3/2 molten units.', points: 260 },
];

export const FractionForge: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const [crucibleVials, setCrucibleVials] = useState<FractionVial[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isForged, setIsForged] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const recipe = RECIPES[currentRecipeIdx];

  // Calculate current sum
  const currentTotalVal = crucibleVials.reduce((sum, v) => sum + v.val, 0);

  // Add vial to crucible
  const addVial = (vial: FractionVial) => {
    if (isForged) return;
    setCrucibleVials((prev) => [...prev, vial]);
    setFeedback(null);
  };

  // Remove vial from crucible
  const removeVial = (idx: number) => {
    if (isForged) return;
    setCrucibleVials((prev) => prev.filter((_, i) => i !== idx));
    setFeedback(null);
  };

  // Clear crucible
  const clearCrucible = () => {
    setCrucibleVials([]);
    setFeedback(null);
  };

  // Strike Anvil to Forge
  const handleForge = () => {
    const diff = Math.abs(currentTotalVal - recipe.targetDecimal);

    if (diff < 0.001) {
      setIsForged(true);
      const earned = recipe.points;
      setScore((s) => s + earned);
      setFeedback(`🔥 MASTERPIECE! Successfully forged ${recipe.item}! (+${earned} pts)`);

      gameService.submitScore('fraction-forge', { score: earned, timeTaken: 25 }).catch(() => {});
    } else if (currentTotalVal < recipe.targetDecimal) {
      setFeedback(`⚠️ Insufficient volume. Current volume is under target. Need +${(recipe.targetDecimal - currentTotalVal).toFixed(3)} more.`);
    } else {
      setFeedback(`⚠️ Crucible overflow! Excess molten metal by +${(currentTotalVal - recipe.targetDecimal).toFixed(3)}. Remove a fraction.`);
    }
  };

  const handleNextRecipe = () => {
    if (currentRecipeIdx + 1 < RECIPES.length) {
      setCurrentRecipeIdx((r) => r + 1);
      setCrucibleVials([]);
      setIsForged(false);
      setFeedback(null);
    } else {
      navigate(ROUTES.GAMES);
    }
  };

  const handleExit = () => {
    navigate(ROUTES.GAMES);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-red-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Game</span>
          </Button>
          <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-700" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-4 w-4 text-blue-500" />
            <span>Fraction Forge</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
              {recipe.tier} ({currentRecipeIdx + 1} of {RECIPES.length})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Target Item Recipe Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-300 font-bold">
            Target Item to Forge:
          </span>
          <div className="flex items-baseline justify-center md:justify-start gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{recipe.item}</h1>
            <span className="text-2xl font-mono font-bold text-amber-400 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
              {recipe.targetFraction}
            </span>
          </div>
          <p className="text-xs text-blue-200 max-w-lg mt-1">{recipe.description}</p>
        </div>

        {/* Target Gauge Visualizer */}
        <div className="bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center w-full md:w-56 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-gray-400 block">Crucible Fill Level</span>
          <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className={`h-full transition-all duration-300 ${
                Math.abs(currentTotalVal - recipe.targetDecimal) < 0.001
                  ? 'bg-emerald-400'
                  : currentTotalVal > recipe.targetDecimal
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (currentTotalVal / recipe.targetDecimal) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-gray-300 font-bold">
            <span>{currentTotalVal.toFixed(3)}</span>
            <span>Target: {recipe.targetDecimal.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fraction Ingot Shelf */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
            <span>Molten Fraction Vials</span>
            <span className="text-[11px] font-normal text-gray-400">Click to add</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {FRACTION_VIALS.map((vial) => (
              <button
                key={vial.id}
                type="button"
                onClick={() => addVial(vial)}
                className={`p-3 rounded-xl bg-gradient-to-br ${vial.color} text-white shadow-sm hover:scale-105 active:scale-95 transition-all text-center group`}
              >
                <span className="text-2xl font-black font-mono block">{vial.label}</span>
                <span className="text-[10px] font-medium opacity-80 block mt-0.5">
                  val ≈ {vial.val.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Forge Crucible */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Molten Crucible Mixture</span>
              </h3>
              {crucibleVials.length > 0 && (
                <button
                  type="button"
                  onClick={clearCrucible}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Empty Crucible
                </button>
              )}
            </div>

            {/* Added Vials List */}
            <div className="min-h-[140px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-4 flex flex-wrap items-center justify-center gap-2.5 bg-gray-50/50 dark:bg-gray-800/30">
              {crucibleVials.length === 0 ? (
                <div className="text-center text-gray-400 text-xs">
                  Crucible is empty. Click fraction vials on the left to combine them in the forge.
                </div>
              ) : (
                crucibleVials.map((vial, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <span className="font-mono text-sm font-black text-primary">{vial.label}</span>
                    <button
                      type="button"
                      onClick={() => removeVial(idx)}
                      className="text-gray-400 hover:text-red-500 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {feedback && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${isForged ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40'}`}>
                {feedback}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            {isForged ? (
              <Button
                onClick={handleNextRecipe}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg"
              >
                {currentRecipeIdx + 1 < RECIPES.length ? 'Next Forging Recipe →' : 'Master Blacksmith Crown Won!'}
              </Button>
            ) : (
              <Button
                onClick={handleForge}
                disabled={crucibleVials.length === 0}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-primary/25"
              >
                Strike Anvil & Forge
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Fraction Forge?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your score of {score} pts will be preserved.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Keep Forging
                </Button>
                <Button
                  onClick={handleExit}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                >
                  Exit to Games
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
