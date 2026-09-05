import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FlaskConical, Award, Sparkles, RotateCcw, Plus, Check, ShieldAlert, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface ElementCard {
  symbol: string;
  name: string;
  atomicNumber: number;
  valency: number;
  type: 'metal' | 'nonmetal' | 'noble';
  color: string;
}

const AVAILABLE_ELEMENTS: ElementCard[] = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, valency: 1, type: 'nonmetal', color: 'from-sky-400 to-blue-500' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, valency: 2, type: 'nonmetal', color: 'from-red-400 to-rose-500' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, valency: 4, type: 'nonmetal', color: 'from-gray-600 to-slate-800' },
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, valency: 1, type: 'metal', color: 'from-amber-400 to-orange-500' },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, valency: 1, type: 'nonmetal', color: 'from-emerald-400 to-green-600' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, valency: 3, type: 'nonmetal', color: 'from-indigo-400 to-blue-600' },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, valency: 2, type: 'metal', color: 'from-yellow-400 to-amber-600' },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, valency: 3, type: 'metal', color: 'from-stone-500 to-orange-700' },
];

interface CompoundTarget {
  name: string;
  formula: string;
  required: Record<string, number>; // e.g. { H: 2, O: 1 }
  bondType: 'Covalent' | 'Ionic';
  description: string;
  points: number;
}

const TARGET_COMPOUNDS: CompoundTarget[] = [
  { name: 'Water', formula: 'H₂O', required: { H: 2, O: 1 }, bondType: 'Covalent', description: 'Universal solvent vital for all known forms of life.', points: 150 },
  { name: 'Table Salt', formula: 'NaCl', required: { Na: 1, Cl: 1 }, bondType: 'Ionic', description: 'Crystalline mineral essential for biological nerve impulses.', points: 150 },
  { name: 'Methane', formula: 'CH₄', required: { C: 1, H: 4 }, bondType: 'Covalent', description: 'Primary component of natural gas with tetrahedral VSEPR geometry.', points: 200 },
  { name: 'Carbon Dioxide', formula: 'CO₂', required: { C: 1, O: 2 }, bondType: 'Covalent', description: 'Linear greenhouse gas utilized by plants in photosynthesis.', points: 200 },
  { name: 'Ammonia', formula: 'NH₃', required: { N: 1, H: 3 }, bondType: 'Covalent', description: 'Trigonal pyramidal compound central to fertilizer synthesis.', points: 250 },
  { name: 'Calcium Chloride', formula: 'CaCl₂', required: { Ca: 1, Cl: 2 }, bondType: 'Ionic', description: 'De-icing salt with high enthalpy change of solution.', points: 250 },
];

export const ElementFactory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [crucible, setCrucible] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);
  const [synthesisSuccess, setSynthesisSuccess] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const target = TARGET_COMPOUNDS[currentLevel];

  // Add atom to crucible
  const addAtom = (symbol: string) => {
    if (synthesisSuccess) return;
    setCrucible((prev) => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1,
    }));
    setFeedback(null);
  };

  // Remove atom from crucible
  const removeAtom = (symbol: string) => {
    if (synthesisSuccess) return;
    setCrucible((prev) => {
      const next = { ...prev };
      if (next[symbol] > 1) {
        next[symbol] -= 1;
      } else {
        delete next[symbol];
      }
      return next;
    });
    setFeedback(null);
  };

  // Clear crucible
  const clearCrucible = () => {
    setCrucible({});
    setFeedback(null);
  };

  // Check bond synthesis
  const handleSynthesize = () => {
    // Check if crucible exactly matches target required
    const req = target.required;
    const crucibleKeys = Object.keys(crucible);
    const reqKeys = Object.keys(req);

    if (crucibleKeys.length !== reqKeys.length) {
      setFeedback('⚠️ Incorrect proportion of elements. Inspect the chemical formula!');
      return;
    }

    const matches = reqKeys.every((key) => crucible[key] === req[key]);
    if (matches) {
      setSynthesisSuccess(true);
      const pts = target.points;
      setScore((s) => s + pts);
      setFeedback(`✨ SUCCESS! Synthesized ${target.name} (${target.formula})!`);

      gameService.submitScore('element-factory', { score: pts, timeTaken: 30 }).catch(() => {});
    } else {
      setFeedback('⚠️ Incompatible valency or atom counts. Balance your valence bonds!');
    }
  };

  const handleNextLevel = () => {
    if (currentLevel + 1 < TARGET_COMPOUNDS.length) {
      setCurrentLevel((l) => l + 1);
      setCrucible({});
      setSynthesisSuccess(false);
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
            <FlaskConical className="h-4 w-4 text-emerald-500" />
            <span>Element Factory: Compound Synthesis</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 font-semibold">
              Mission {currentLevel + 1} of {TARGET_COMPOUNDS.length}
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

      {/* Target Mission Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-300 font-bold">
            Target Compound to Synthesize:
          </span>
          <div className="flex items-baseline justify-center md:justify-start gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{target.name}</h1>
            <span className="text-2xl font-mono font-bold text-amber-400 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
              {target.formula}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/30 border border-purple-400/40">
              {target.bondType} Bond
            </span>
          </div>
          <p className="text-xs text-purple-200 max-w-lg mt-1">{target.description}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Required Stoichiometry</span>
          <div className="flex items-center gap-3">
            {Object.entries(target.required).map(([sym, count]) => (
              <div key={sym} className="flex items-center gap-1 font-mono text-sm font-bold">
                <span className="text-amber-400">{sym}:</span>
                <span className="text-white bg-white/20 px-2 py-0.5 rounded">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesis Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Element Inventory Rack */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
            <span>Elemental Rack</span>
            <span className="text-[11px] font-normal text-gray-400">Click to add atom</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {AVAILABLE_ELEMENTS.map((el) => (
              <button
                key={el.symbol}
                type="button"
                onClick={() => addAtom(el.symbol)}
                className={`p-3 rounded-xl bg-gradient-to-br ${el.color} text-white shadow-sm hover:scale-105 active:scale-95 transition-all text-left relative overflow-hidden group`}
              >
                <span className="text-[10px] font-mono opacity-80 block">{el.atomicNumber}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black">{el.symbol}</span>
                  <span className="text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded">
                    Valency {el.valency}
                  </span>
                </div>
                <span className="text-[10px] font-medium opacity-90 truncate block">{el.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reaction Crucible */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                <span>Reaction Crucible</span>
              </h3>
              {Object.keys(crucible).length > 0 && (
                <button
                  type="button"
                  onClick={clearCrucible}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Clear Flask
                </button>
              )}
            </div>

            {/* Crucible Flask Vessel */}
            <div className="min-h-[160px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-6 flex flex-wrap items-center justify-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
              {Object.keys(crucible).length === 0 ? (
                <div className="text-center text-gray-400 text-xs">
                  Flask is empty. Click elements on the left to add atoms into the reaction chamber.
                </div>
              ) : (
                Object.entries(crucible).map(([sym, count]) => {
                  const el = AVAILABLE_ELEMENTS.find((e) => e.symbol === sym);
                  return (
                    <motion.div
                      key={sym}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${el?.color || 'from-gray-500 to-gray-700'} text-white font-black flex items-center justify-center text-sm`}>
                        {sym}
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">×{count}</span>
                      <button
                        type="button"
                        onClick={() => removeAtom(sym)}
                        className="text-gray-400 hover:text-red-500 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {feedback && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${synthesisSuccess ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40'}`}>
                {feedback}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            {synthesisSuccess ? (
              <Button
                onClick={handleNextLevel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg"
              >
                {currentLevel + 1 < TARGET_COMPOUNDS.length ? 'Next Compound →' : 'Complete Chemistry Mission!'}
              </Button>
            ) : (
              <Button
                onClick={handleSynthesize}
                disabled={Object.keys(crucible).length === 0}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-primary/25"
              >
                Synthesize Bonds
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Element Factory?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your score of {score} pts will be saved to your profile.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Stay Playing
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
