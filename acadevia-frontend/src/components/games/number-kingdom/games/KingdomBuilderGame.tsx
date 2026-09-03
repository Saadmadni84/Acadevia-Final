import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Compass, Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PetConfig } from '../types';
import { cn } from '@/lib/utils';

interface KingdomBuilderGameProps {
  currentPet: PetConfig;
  onComplete: (isSuccess: boolean, timeSpentSec: number) => void;
  onBackToMap: () => void;
}

interface BuildingProject {
  id: number;
  title: string;
  blueprintName: string;
  blueprintIcon: string;
  instruction: string;
  concept: string;
  mathExplanation: string;
  initialTreasury: number;
  expenses: { label: string; amount: number; icon: string }[];
  targetRemainder: number; // initialTreasury - sum(expenses)
  gridRequirement: {
    lengthMeters: number;
    widthMeters: number;
    targetAreaSqM: number;
    targetPerimeterM: number;
  };
  companionHint: string;
}

const KINGDOM_PROJECTS: BuildingProject[] = [
  {
    id: 1,
    title: 'Project 1: The Grand Royal Citadel & Treasury',
    blueprintName: 'Fortress Treasury & Perimeter Wall',
    blueprintIcon: '🏰',
    instruction: 'Calculate the remaining construction budget (₹2,500 − ₹875 − ₹465) and set wall dimensions (12m × 8m).',
    concept: 'Multi-Step Budgeting & Area/Perimeter (12m × 8m)',
    mathExplanation: '₹2,500 − ₹1,340 = ₹1,160 budget verified! Area = 96 m² and Perimeter = 40 m! Citadel erected!',
    initialTreasury: 2500,
    expenses: [
      { label: 'Granite Stone Blocks', amount: 875, icon: '🧱' },
      { label: 'Enchanted Timber Beams', amount: 465, icon: '🪵' },
    ],
    targetRemainder: 1160,
    gridRequirement: {
      lengthMeters: 12,
      widthMeters: 8,
      targetAreaSqM: 96,
      targetPerimeterM: 40,
    },
    companionHint: 'Total spending: ₹875 + ₹465 = ₹1,340. Subtract that from ₹2,500 to find the remaining treasury! Area is Length × Width (12 × 8).',
  },
  {
    id: 2,
    title: 'Project 2: Astral Observatory & Dome Net',
    blueprintName: 'Stargazer Tower & Coordinate Grid',
    blueprintIcon: '🔭',
    instruction: 'Manage the royal telescope fund (₹4,200 − ₹1,850 − ₹920) and calibrate lens dimensions (15m × 6m).',
    concept: 'Multi-digit Arithmetic & Geometric Area (15m × 6m)',
    mathExplanation: '₹4,200 − ₹2,770 = ₹1,430 remainder! Area = 90 m², Perimeter = 42 m! The telescope points to the cosmos!',
    initialTreasury: 4200,
    expenses: [
      { label: 'Polished Quartz Lenses', amount: 1850, icon: '🔮' },
      { label: 'Brass Gear Mountings', amount: 920, icon: '⚙️' },
    ],
    targetRemainder: 1430,
    gridRequirement: {
      lengthMeters: 15,
      widthMeters: 6,
      targetAreaSqM: 90,
      targetPerimeterM: 42,
    },
    companionHint: 'Add ₹1,850 + ₹920 = ₹2,770. Subtract from ₹4,200 = ₹1,430. Area = 15 × 6 = 90 m².',
  },
];

export const KingdomBuilderGame: React.FC<KingdomBuilderGameProps> = ({
  currentPet,
  onComplete,
  onBackToMap,
}) => {
  const [projectIndex, setProjectIndex] = useState(0);
  const [treasuryInput, setTreasuryInput] = useState<number | ''>('');
  const [lengthSlider, setLengthSlider] = useState<number>(10);
  const [widthSlider, setWidthSlider] = useState<number>(5);
  const [isConstructed, setIsConstructed] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime] = useState(Date.now());

  const currentProject = KINGDOM_PROJECTS[projectIndex];

  React.useEffect(() => {
    setTreasuryInput('');
    setLengthSlider(10);
    setWidthSlider(5);
    setIsConstructed(false);
    setFeedback('');
  }, [projectIndex]);

  const currentArea = lengthSlider * widthSlider;
  const currentPerimeter = 2 * (lengthSlider + widthSlider);

  const handleBuildStructure = () => {
    const isTreasuryCorrect = Number(treasuryInput) === currentProject.targetRemainder;
    const isDimensionsCorrect =
      lengthSlider === currentProject.gridRequirement.lengthMeters &&
      widthSlider === currentProject.gridRequirement.widthMeters;

    if (isTreasuryCorrect && isDimensionsCorrect) {
      setIsConstructed(true);
      setFeedback(currentProject.mathExplanation);
    } else if (!isTreasuryCorrect && isDimensionsCorrect) {
      setFeedback(
        `The wall layout (12m × 8m) is correct, but the treasury calculation is off! Check ₹${currentProject.initialTreasury} minus all expenses.`
      );
    } else if (isTreasuryCorrect && !isDimensionsCorrect) {
      setFeedback(
        `Treasury balance (₹${currentProject.targetRemainder}) is verified, but the architect requires Length = ${currentProject.gridRequirement.lengthMeters}m and Width = ${currentProject.gridRequirement.widthMeters}m!`
      );
    } else {
      setFeedback(
        'Both the remaining treasury budget and grid dimensions need fine tuning. Consult the blueprint and recalculate!'
      );
    }
  };

  const handleNextLevelOrFinish = () => {
    if (projectIndex < KINGDOM_PROJECTS.length - 1) {
      setProjectIndex((prev) => prev + 1);
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
          <span className="text-xl">🏰</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Kingdom Builder
          </span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
            Class 5 Master Engineering
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
              <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {currentProject.concept}
              </span>
              <span className="text-xs text-gray-400">
                · Project {projectIndex + 1} of {KINGDOM_PROJECTS.length}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {currentProject.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {currentProject.instruction}
            </p>
          </div>

          <div className="flex gap-1.5">
            {KINGDOM_PROJECTS.map((prj, idx) => (
              <div
                key={prj.id}
                className={cn(
                  'w-8 h-2 rounded-full transition-all',
                  idx < projectIndex
                    ? 'bg-emerald-500'
                    : idx === projectIndex
                    ? 'bg-purple-600 w-12'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* 2D Interactive Architectural Workshop Canvas */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950 to-indigo-950 border-2 border-purple-500/30 overflow-hidden shadow-2xl p-6 text-white space-y-6">
          {/* Top Panel: Financial Ledger & Treasury Calculation */}
          <div className="p-4 rounded-2xl bg-white/5 border border-purple-400/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>💰 Royal Treasury Ledger</span>
              </span>
              <span className="text-xs font-mono text-gray-300">
                Initial Budget: <strong className="text-amber-300">₹{currentProject.initialTreasury}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {currentProject.expenses.map((exp, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-purple-900/60 flex items-center gap-2">
                  <span className="text-2xl">{exp.icon}</span>
                  <div>
                    <span className="text-gray-400 block text-[10px]">{exp.label}</span>
                    <span className="text-sm font-black text-red-400">− ₹{exp.amount}</span>
                  </div>
                </div>
              ))}

              {/* Remainder Input */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/40 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-purple-300">Remaining Treasury (₹):</span>
                <input
                  type="number"
                  placeholder="Enter remaining ₹"
                  value={treasuryInput}
                  onChange={(e) => setTreasuryInput(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 bg-black/60 border border-purple-500 rounded-lg px-2.5 py-1 text-sm font-mono font-black text-amber-300 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Bottom Panel: Interactive Architectural Grid & Dimensions */}
          <div className="p-4 rounded-2xl bg-white/5 border border-purple-400/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📐 Dimension Sliders & Spatial Geometry</span>
              </span>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-emerald-300">Area = {currentArea} m² (Target: {currentProject.gridRequirement.targetAreaSqM} m²)</span>
                <span className="text-cyan-300">Perimeter = {currentPerimeter} m</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-300">
                  <span>Length (Meters):</span>
                  <span className="font-mono text-purple-300 text-sm font-black">{lengthSlider} m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={lengthSlider}
                  onChange={(e) => setLengthSlider(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-300">
                  <span>Width (Meters):</span>
                  <span className="font-mono text-purple-300 text-sm font-black">{widthSlider} m</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={widthSlider}
                  onChange={(e) => setWidthSlider(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive Grid Representation */}
            <div className="h-36 rounded-2xl bg-black/50 border border-purple-500/30 flex items-center justify-center p-3 relative overflow-hidden">
              <motion.div
                animate={{
                  width: `${(lengthSlider / 20) * 100}%`,
                  height: `${(widthSlider / 15) * 100}%`,
                }}
                transition={{ type: 'spring', damping: 20 }}
                className={cn(
                  'rounded-xl border-2 flex items-center justify-center font-black text-sm sm:text-base shadow-lg transition-colors',
                  currentArea === currentProject.gridRequirement.targetAreaSqM &&
                    lengthSlider === currentProject.gridRequirement.lengthMeters
                    ? 'border-emerald-400 bg-emerald-600/30 text-emerald-200'
                    : 'border-purple-400 bg-purple-600/20 text-purple-200'
                )}
              >
                {currentProject.blueprintIcon} {lengthSlider}m × {widthSlider}m = {currentArea} m²
              </motion.div>
            </div>
          </div>

          {/* Construct CTA */}
          <div className="flex justify-end pt-1">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleBuildStructure}
              disabled={isConstructed}
              className="shadow-lg cursor-pointer font-bold px-8 text-base"
            >
              🏛️ Construct & Expand Citadel
            </Button>
          </div>
        </div>

        {/* Dynamic Companion Hint & Feedback */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-300/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{currentPet.avatar}</span>
            <div>
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300 block">
                {currentPet.name}'s Engineering Guidance:
              </span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium">
                {feedback || currentProject.companionHint}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isConstructed && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleNextLevelOrFinish}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="shadow-md cursor-pointer shrink-0 font-bold"
                >
                  {projectIndex < KINGDOM_PROJECTS.length - 1 ? 'Next Project →' : 'Complete Kingdom Expansion 🏆'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
