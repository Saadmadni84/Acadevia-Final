import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Info,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface KingsRoadGameProps {
  onComplete: () => void;
}

interface DestinationZone {
  id: 'north_kosala' | 'east_magadha' | 'south_kashi' | 'west_avanti';
  name: string;
  historicalEra: string;
  destinationLabel: string;
  isCorrect: boolean;
  arrivalScene: string;
  signpostHint: string;
  feedbackDialogue: string;
  // Trigger box coordinate in world percentage
  trigger: { minX: number; maxX: number; minY: number; maxY: number };
  landmarkIcon: string;
  landmarkPos: { x: number; y: number };
  roadPathColor: string;
}

const DESTINATIONS: DestinationZone[] = [
  {
    id: 'north_kosala',
    name: 'Kosala',
    historicalEra: 'Northern Foothills Highway',
    destinationLabel: 'Northern Road to Kosala & Shravasti',
    isCorrect: false,
    arrivalScene: '🏕️ Kosala Border Post',
    signpostHint: '“Northern route along Sarayu river towards the foothills of the Himalayas and ancient Kosala.”',
    feedbackDialogue: '“This northern road leads toward the kingdom of Kosala and the Himalayan foothills. But our true royal seat is Magadha in the east! Let us return to the crossroads.”',
    trigger: { minX: 35, maxX: 65, minY: 0, maxY: 16 },
    landmarkIcon: '🏕️',
    landmarkPos: { x: 50, y: 8 },
    roadPathColor: '#10b981',
  },
  {
    id: 'east_magadha',
    name: 'Magadha',
    historicalEra: 'Eastern Imperial Highway',
    destinationLabel: 'Eastern Highway to Magadha & Pataliputra',
    isCorrect: true,
    arrivalScene: '🏰 Pataliputra Citadel Gate',
    signpostHint: '“Follow the fertile Ganga and Son river plains east to Pataliputra, capital of Magadha.”',
    feedbackDialogue: '“At last! The fortified stone citadel of Pataliputra! Here on the banks of the Ganga, we shall unite the realm and establish the glorious Mauryan Empire!”',
    trigger: { minX: 84, maxX: 100, minY: 35, maxY: 65 },
    landmarkIcon: '🏰',
    landmarkPos: { x: 92, y: 50 },
    roadPathColor: '#f59e0b',
  },
  {
    id: 'south_kashi',
    name: 'Kashi',
    historicalEra: 'Southern River Pilgrim Trail',
    destinationLabel: 'Southern Trail to Kashi & Varanasi',
    isCorrect: false,
    arrivalScene: '🛕 Kashi Sacred River Ghats',
    signpostHint: '“Southern path leading down to the sacred river ghats and silk markets of Varanasi.”',
    feedbackDialogue: '“These ancient stone ghats belong to sacred Kashi. While a great center of learning, Chandragupta’s imperial army and kingdom lie east in Magadha!”',
    trigger: { minX: 35, maxX: 65, minY: 84, maxY: 100 },
    landmarkIcon: '🛕',
    landmarkPos: { x: 50, y: 92 },
    roadPathColor: '#6366f1',
  },
  {
    id: 'west_avanti',
    name: 'Avanti',
    historicalEra: 'Southwestern Trade Highway',
    destinationLabel: 'Western Highway to Avanti & Ujjain',
    isCorrect: false,
    arrivalScene: '🏪 Ujjain Trade Caravanserai',
    signpostHint: '“Southwestern route into Malwa plateau towards the bustling trading markets of Ujjayini.”',
    feedbackDialogue: '“The merchant caravans here are bound for the cotton markets of Avanti and Ujjain. We must head back to the crossroads to reach Magadha!”',
    trigger: { minX: 0, maxX: 16, minY: 35, maxY: 65 },
    landmarkIcon: '🏪',
    landmarkPos: { x: 8, y: 50 },
    roadPathColor: '#f43f5e',
  },
];

export const KingsRoadGame: React.FC<KingsRoadGameProps> = ({ onComplete }) => {
  // Player Position in percentage (Center is 50%, 50%)
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [facing, setFacing] = useState<'left' | 'right' | 'up' | 'down'>('down');
  const [activeSignpost, setActiveSignpost] = useState<string | null>(null);
  const [reachedDestination, setReachedDestination] = useState<DestinationZone | null>(null);
  const [isTravellingScene, setIsTravellingScene] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  // Check if player entered any road zone
  const checkTriggers = useCallback((pos: { x: number; y: number }) => {
    if (reachedDestination || isTravellingScene) return;

    for (const dest of DESTINATIONS) {
      if (
        pos.x >= dest.trigger.minX &&
        pos.x <= dest.trigger.maxX &&
        pos.y >= dest.trigger.minY &&
        pos.y <= dest.trigger.maxY
      ) {
        setReachedDestination(dest);
        setIsTravellingScene(true);

        setTimeout(() => {
          setIsTravellingScene(false);
          setShowArrivalModal(true);
        }, 1600);
        break;
      }
    }
  }, [isTravellingScene, reachedDestination]);

  // Movement handler with boundary clamping
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (reachedDestination || isTravellingScene) return;

    setPlayerPos((prev) => {
      const nextX = Math.max(6, Math.min(94, prev.x + dx));
      const nextY = Math.max(6, Math.min(94, prev.y + dy));

      if (dx > 0) setFacing('right');
      else if (dx < 0) setFacing('left');
      else if (dy < 0) setFacing('up');
      else if (dy > 0) setFacing('down');

      checkTriggers({ x: nextX, y: nextY });
      return { x: nextX, y: nextY };
    });
  }, [checkTriggers, isTravellingScene, reachedDestination]);

  // Keyboard navigation (WASD & Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const STEP = 8;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -STEP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, STEP);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-STEP, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(STEP, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Direct touch/click navigation to world point
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reachedDestination || isTravellingScene) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(6, Math.min(94, clickX));
    const clampedY = Math.max(6, Math.min(94, clickY));

    if (clampedX > playerPos.x) setFacing('right');
    else if (clampedX < playerPos.x) setFacing('left');

    setPlayerPos({ x: clampedX, y: clampedY });
    checkTriggers({ x: clampedX, y: clampedY });
  };

  const handleReturnToCrossroads = () => {
    setPlayerPos({ x: 50, y: 50 });
    setFacing('down');
    setReachedDestination(null);
    setIsTravellingScene(false);
    setShowArrivalModal(false);
    setActiveSignpost(null);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Narrative & Navigation HUD */}
      <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50 dark:from-slate-900 dark:via-amber-950/20 dark:to-orange-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
              👑
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 block">
                Chapter 1 · Ancient India (c. 321 BCE)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                The Crossroads of Magadha
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Navigate Chandragupta Maurya using <strong>WASD / Arrow Keys</strong> or <strong>tap on the map</strong>. Explore the crossroads to find the road back to <strong>Magadha</strong>.
              </p>
            </div>
          </div>

          {/* Controls Quick Legend */}
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 bg-white/80 dark:bg-gray-800/80 px-3.5 py-1.5 rounded-full border border-amber-300/60 shadow-2xs">
            <Compass className="h-4 w-4 text-amber-600 animate-spin" />
            <span>Use Arrow Keys or Click to Move</span>
          </div>
        </div>
      </div>

      {/* 2D PHYSICAL CROSSROADS WORLD VIEWPORT */}
      <div className="relative rounded-3xl border-4 border-amber-400/90 dark:border-amber-700/80 bg-[#E8D8B8] dark:bg-[#1E1B18] overflow-hidden shadow-2xl h-[460px] sm:h-[500px]">
        {/* Clickable Map Background Canvas */}
        <div
          onClick={handleMapClick}
          className="absolute inset-0 cursor-crosshair overflow-hidden"
        >
          {/* Natural Terrain & Grass Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #78350f 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* 4 PHYSICAL COBBLESTONE ROADS (CROSSROADS SHAPE) */}
          {/* Vertical Road (North-South) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-28 sm:w-36 bg-[#D1BC95] dark:bg-[#342D26] border-x-4 border-dashed border-[#B0986F] dark:border-[#524638] flex flex-col justify-between items-center py-2 pointer-events-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded shadow-xs">
              ▲ Northern Road (Kosala)
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded shadow-xs">
              ▼ Southern Trail (Kashi)
            </span>
          </div>

          {/* Horizontal Road (West-East) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-28 sm:h-36 bg-[#D1BC95] dark:bg-[#342D26] border-y-4 border-dashed border-[#B0986F] dark:border-[#524638] flex justify-between items-center px-2 pointer-events-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 dark:text-rose-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded shadow-xs">
              ◀ Western Road (Avanti)
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded shadow-xs">
              Eastern Highway (Magadha) ▶
            </span>
          </div>

          {/* Central Crossroads Cobblestone Plaza */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-36 sm:h-44 rounded-3xl bg-[#C8B084] dark:bg-[#3D342B] border-4 border-[#9C8258] flex items-center justify-center pointer-events-none shadow-inner">
            <span className="text-2xl opacity-60">🏛️</span>
          </div>

          {/* Environmental World Props (Trees, Rivers, Rocks) */}
          {/* North-West Forest */}
          <div className="absolute top-4 left-6 text-3xl opacity-80 pointer-events-none">🌲🌳🌲</div>
          <div className="absolute top-16 left-12 text-2xl opacity-75 pointer-events-none">🌳🌲</div>

          {/* North-East Mountain Foothills */}
          <div className="absolute top-4 right-8 text-3xl opacity-80 pointer-events-none">🏔️🌲🏔️</div>
          <div className="absolute top-16 right-16 text-2xl opacity-75 pointer-events-none">🌲🪨</div>

          {/* South-West Riverside Groves */}
          <div className="absolute bottom-6 left-8 text-3xl opacity-80 pointer-events-none">🌾🌴🌾</div>
          <div className="absolute bottom-16 left-16 text-2xl opacity-75 pointer-events-none">🌊🌾</div>

          {/* South-East Ancient Stupa Grounds */}
          <div className="absolute bottom-6 right-8 text-3xl opacity-80 pointer-events-none">🪨🌾🛕</div>
          <div className="absolute bottom-16 right-16 text-2xl opacity-75 pointer-events-none">🌴🌾</div>

          {/* 4 PHYSICAL DESTINATION ARCHWAYS & SIGNPOSTS */}
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              style={{ left: `${dest.landmarkPos.x}%`, top: `${dest.landmarkPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-lg animate-pulse">
                {dest.landmarkIcon}
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 mt-1 rounded-full bg-black/75 text-white shadow-xs">
                {dest.name} Gate
              </span>
            </div>
          ))}

          {/* Interactive Central Ancient Signpost */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSignpost('Ancient Junction Milestone: Examine road clues by travelling down the physical paths.');
            }}
            className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-100 border-2 border-amber-600 text-xs font-bold text-amber-950 shadow-md hover:scale-110 active:scale-95 transition-transform z-20 cursor-pointer flex items-center gap-1"
          >
            <span>📜</span>
            <span className="text-[9px] font-black uppercase">Milestone Pillar</span>
          </button>

          {/* PLAYABLE CHANDRAGUPTA MAURYA CHARACTER */}
          <motion.div
            animate={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30"
          >
            {/* Crown Glow & Character Model */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center text-2xl">
                {facing === 'left' ? '👑' : facing === 'right' ? '👑' : '👑'}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-black/30 blur-[2px]" />
            </div>

            <span className="text-[10px] font-black text-white bg-amber-950/90 px-2 py-0.5 rounded-full shadow-md mt-0.5 whitespace-nowrap">
              Chandragupta Maurya
            </span>
          </motion.div>
        </div>

        {/* Dynamic Travelling Overlay Animation */}
        <AnimatePresence>
          {isTravellingScene && reachedDestination && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-40 text-white space-y-4"
            >
              <motion.div
                animate={{ x: [-30, 30], y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-6xl"
              >
                👑🐎💨
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-black">
                Travelling along the {reachedDestination.destinationLabel}...
              </h3>
              <p className="text-xs text-amber-200 max-w-sm">
                Passing through ancient stone milestones, roadside resting wells, and merchant caravans.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arrival & Consequence Dialogue Modal */}
        <AnimatePresence>
          {showArrivalModal && reachedDestination && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <div className="max-w-lg w-full bg-white dark:bg-card-dark rounded-3xl border-2 border-amber-400 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
                <div className="text-5xl animate-bounce">
                  {reachedDestination.isCorrect ? '🏰👑✨' : '🏕️🧭'}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                    {reachedDestination.arrivalScene}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {reachedDestination.isCorrect
                      ? 'Welcome Home to Magadha!'
                      : `Reached ${reachedDestination.name}`}
                  </h3>

                  <div className="mt-3 p-4 rounded-2xl bg-amber-50 dark:bg-gray-800 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 border border-amber-200 text-left italic leading-relaxed">
                    {reachedDestination.feedbackDialogue}
                  </div>
                </div>

                {reachedDestination.isCorrect ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Chapter 1 Complete: Founded Mauryan Capital (+50 XP · ⭐ 1 Star)</span>
                    </div>

                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={onComplete}
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                      className="w-full shadow-md font-bold cursor-pointer"
                    >
                      Unlock Chapter 2: The Traveller’s Path →
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleReturnToCrossroads}
                      leftIcon={<RotateCcw className="h-4 w-4" />}
                      className="w-full shadow-xs font-bold cursor-pointer"
                    >
                      Return to the Crossroads & Try Another Road
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-Screen D-Pad Navigation Controls (Touch & Keyboard Helper) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          📍 <strong>Current Position:</strong> ({Math.round(playerPos.x)}%, {Math.round(playerPos.y)}%) · Walk to any of the 4 road ends to enter the destination.
        </div>

        {/* D-Pad Buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => movePlayer(0, -12)}
            className="w-12 h-9 rounded-xl bg-amber-100 dark:bg-gray-800 border border-amber-300 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold hover:bg-amber-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
            title="Move North"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => movePlayer(-12, 0)}
              className="w-12 h-9 rounded-xl bg-amber-100 dark:bg-gray-800 border border-amber-300 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold hover:bg-amber-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move West"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 12)}
              className="w-12 h-9 rounded-xl bg-amber-100 dark:bg-gray-800 border border-amber-300 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold hover:bg-amber-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move South"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(12, 0)}
              className="w-12 h-9 rounded-xl bg-amber-100 dark:bg-gray-800 border border-amber-300 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold hover:bg-amber-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move East"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
