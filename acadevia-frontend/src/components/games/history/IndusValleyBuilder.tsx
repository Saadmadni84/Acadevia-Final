import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Landmark, Award, Sparkles, Droplets, Warehouse, Home, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

type BuildingType = 'road' | 'house' | 'drain' | 'granary' | 'bath';

interface BuildingDef {
  type: BuildingType;
  name: string;
  costBricks: number;
  icon: string;
  effect: string;
}

const BUILDINGS: BuildingDef[] = [
  { type: 'road', name: 'Grid Street', costBricks: 15, icon: '🧱', effect: '+10 Urban Connectivity' },
  { type: 'house', name: 'Courtyard House', costBricks: 25, icon: '🏠', effect: '+15 Citizens Population' },
  { type: 'drain', name: 'Covered Drainage', costBricks: 20, icon: '💧', effect: '+20 Public Sanitation' },
  { type: 'granary', name: 'Great Granary', costBricks: 60, icon: '🌾', effect: '+50 Grain Surplus Storage' },
  { type: 'bath', name: 'Great Bath & Well', costBricks: 90, icon: '🏛️', effect: '+40 Civic Hygiene & Culture' },
];

export const IndusValleyBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Grid is 6x6 = 36 tiles
  const [grid, setGrid] = useState<(BuildingType | null)[]>(Array(36).fill(null));
  const [selectedTool, setSelectedTool] = useState<BuildingType>('road');

  // Economy
  const [bakedBricks, setBakedBricks] = useState(250);
  const [population, setPopulation] = useState(40);
  const [sanitationScore, setSanitationScore] = useState(50);
  const [grainSurplus, setGrainSurplus] = useState(120);
  const [score, setScore] = useState(0);
  const [civLevel, setCivLevel] = useState('Harappan Settlement');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Place building on tile
  const handleTileClick = (index: number) => {
    if (grid[index] !== null) return; // already occupied

    const def = BUILDINGS.find((b) => b.type === selectedTool);
    if (!def || bakedBricks < def.costBricks) return;

    setBakedBricks((b) => b - def.costBricks);
    setGrid((prev) => {
      const next = [...prev];
      next[index] = selectedTool;
      return next;
    });

    // Update urban statistics
    if (selectedTool === 'house') setPopulation((p) => p + 15);
    if (selectedTool === 'drain') setSanitationScore((s) => Math.min(100, s + 12));
    if (selectedTool === 'granary') setGrainSurplus((g) => g + 40);
    if (selectedTool === 'bath') {
      setSanitationScore((s) => Math.min(100, s + 20));
      setPopulation((p) => p + 25);
    }

    const earned = 50;
    setScore((s) => s + earned);

    // Progress milestone check
    const totalPlaced = grid.filter((g) => g !== null).length + 1;
    if (totalPlaced >= 20) setCivLevel('Glorious Mohenjo-Daro Metropolis');
    else if (totalPlaced >= 12) setCivLevel('Flourishing Harappan Town');
    else if (totalPlaced >= 6) setCivLevel('Planned Urban Center');
  };

  const handleBakeBricks = () => {
    setBakedBricks((b) => b + 60);
  };

  const handleExit = () => {
    gameService.submitScore('indus-valley-builder', { score, timeTaken: 60 }).catch(() => {});
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
            <Landmark className="h-4 w-4 text-amber-600" />
            <span>Civilization Builder: Indus Valley</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold">
              {civLevel}
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

      {/* Urban Dashboard Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Baked Bricks</span>
            <span className="text-2xl font-black text-amber-600">{bakedBricks}</span>
          </div>
          <button
            type="button"
            onClick={handleBakeBricks}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 hover:bg-amber-100 transition"
          >
            +Bake Kiln
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Citizens</span>
          <span className="text-2xl font-black text-primary">{population}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Sanitation Index</span>
          <span className={`text-2xl font-black ${sanitationScore >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {sanitationScore}%
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Grain Surplus</span>
          <span className="text-2xl font-black text-yellow-600">{grainSurplus} Q</span>
        </div>
      </div>

      {/* Main Town Planning Grid */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Harappan City Layout Grid (6×6 Blocks)</span>
          </h3>
          <span className="text-xs text-gray-400">Click an empty block to construct</span>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-3 p-3 rounded-2xl bg-amber-950/20 border border-amber-900/30 max-w-xl mx-auto">
          {grid.map((cell, idx) => {
            const def = BUILDINGS.find((b) => b.type === cell);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTileClick(idx)}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                  cell
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-800 shadow-xs'
                    : 'bg-stone-100 dark:bg-gray-800/40 border-stone-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-gray-800'
                }`}
              >
                {cell ? (
                  <>
                    <span className="text-xl sm:text-2xl">{def?.icon}</span>
                    <span className="text-[9px] font-bold truncate max-w-[45px]">{def?.name}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono">+</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Building Tool Palette */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <span className="text-xs font-bold text-gray-500 block">Select Construction Blueprints:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {BUILDINGS.map((b) => (
              <button
                key={b.type}
                type="button"
                onClick={() => setSelectedTool(b.type)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === b.type
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs scale-105'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[10px] font-mono text-amber-600 font-bold">{b.costBricks} Bricks</span>
                </div>
                <h5 className="font-bold text-xs text-gray-900 dark:text-white mt-1">{b.name}</h5>
                <p className="text-[10px] text-gray-400 truncate">{b.effect}</p>
              </button>
            ))}
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Indus Valley Builder?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your city development score of {score} pts will be preserved.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Keep Building
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
