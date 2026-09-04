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
  Sparkles,
  MapPin,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TravellersPathGameProps {
  onComplete: () => void;
}

interface HistoricalHallZone {
  id: 'harsha_kannauj' | 'ashoka_stupas' | 'chandragupta_citadel' | 'samudragupta_pillar';
  rulerName: string;
  title: string;
  dynastyAndEra: string;
  capitalCity: string;
  landmarkIcon: string;
  landmarkPos: { x: number; y: number };
  isTargetCourt: boolean;
  courtDialogue: string;
  trigger: { minX: number; maxX: number; minY: number; maxY: number };
}

const HISTORICAL_HALLS: HistoricalHallZone[] = [
  {
    id: 'harsha_kannauj',
    rulerName: 'King Harshavardhana',
    title: 'Imperial Court of King Harsha (Kannauj)',
    dynastyAndEra: 'Pushyabhuti Dynasty (c. 606–647 CE)',
    capitalCity: 'Kannauj & Nalanda Mahavihara',
    landmarkIcon: '🛕',
    landmarkPos: { x: 85, y: 30 },
    isTargetCourt: true,
    courtDialogue: '“Welcome to Kannauj, esteemed scholar Xuanzang! We have prepared the assembly grounds for your teachings, and scholars at Nalanda Mahavihara eagerly await your arrival!”',
    trigger: { minX: 75, maxX: 95, minY: 18, maxY: 42 },
  },
  {
    id: 'ashoka_stupas',
    rulerName: 'Emperor Ashoka’s Stupa Memorial',
    title: 'Ashokan Rock & Pillar Edict Sanctuary',
    dynastyAndEra: 'Mauryan Empire (c. 268–232 BCE)',
    capitalCity: 'Pataliputra Dhamma Edicts',
    landmarkIcon: '🦁',
    landmarkPos: { x: 50, y: 22 },
    isTargetCourt: false,
    courtDialogue: '“You stand before the 3rd-Century BCE Buddhist stupas and lion pillars erected by Emperor Ashoka. Xuanzang visited these shrines on his pilgrimage, but his royal host awaits at Kannauj with King Harsha!”',
    trigger: { minX: 40, maxX: 60, minY: 10, maxY: 34 },
  },
  {
    id: 'chandragupta_citadel',
    rulerName: 'Citadel of Chandragupta Maurya',
    title: 'Palace Foundation of Chandragupta Maurya',
    dynastyAndEra: 'Mauryan Empire (c. 321 BCE)',
    capitalCity: 'Early Pataliputra Fort',
    landmarkIcon: '🏰',
    landmarkPos: { x: 20, y: 65 },
    isTargetCourt: false,
    courtDialogue: '“This stone hall commemorates Chandragupta Maurya (4th Century BCE), who lived over 900 years before Xuanzang. Walk forward through time toward the 7th-century court of King Harsha!”',
    trigger: { minX: 10, maxX: 30, minY: 52, maxY: 78 },
  },
  {
    id: 'samudragupta_pillar',
    rulerName: 'Gupta Prashasti Pillar Hall',
    title: 'Prayag Prashasti of Samudragupta',
    dynastyAndEra: 'Gupta Empire (c. 335–375 CE)',
    capitalCity: 'Prayagraj Court',
    landmarkIcon: '🪙',
    landmarkPos: { x: 55, y: 75 },
    isTargetCourt: false,
    courtDialogue: '“This monument records the conquests of Samudragupta (4th Century CE) composed by court poet Harishena. Continue across the River of Time to reach the 7th-century court of King Harsha!”',
    trigger: { minX: 45, maxX: 65, minY: 64, maxY: 88 },
  },
];

export const TravellersPathGame: React.FC<TravellersPathGameProps> = ({ onComplete }) => {
  // Player Position (starts at coastal arrival harbor on the bottom left)
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 12, y: 28 });
  const [facing, setFacing] = useState<'left' | 'right' | 'up' | 'down'>('right');
  const [reachedHall, setReachedHall] = useState<HistoricalHallZone | null>(null);
  const [isTravellingScene, setIsTravellingScene] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  const checkTriggers = useCallback((pos: { x: number; y: number }) => {
    if (reachedHall || isTravellingScene) return;

    for (const hall of HISTORICAL_HALLS) {
      if (
        pos.x >= hall.trigger.minX &&
        pos.x <= hall.trigger.maxX &&
        pos.y >= hall.trigger.minY &&
        pos.y <= hall.trigger.maxY
      ) {
        setReachedHall(hall);
        setIsTravellingScene(true);

        setTimeout(() => {
          setIsTravellingScene(false);
          setShowArrivalModal(true);
        }, 1500);
        break;
      }
    }
  }, [isTravellingScene, reachedHall]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (reachedHall || isTravellingScene) return;

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
  }, [checkTriggers, isTravellingScene, reachedHall]);

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

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reachedHall || isTravellingScene) return;
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

  const handleReturnToTrail = () => {
    setPlayerPos({ x: 28, y: 50 });
    setFacing('right');
    setReachedHall(null);
    setIsTravellingScene(false);
    setShowArrivalModal(false);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Narrative & Navigation HUD */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-sky-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner">
              📜
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 block">
                Chapter 2 · 7th-Century CE Pilgrimage
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                The Pilgrimage to King Harshavardhana
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Guide the scholar <strong>Xuanzang</strong> across historical terrain to meet his royal host <strong>King Harshavardhana</strong> at Kannauj.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 bg-white/80 dark:bg-gray-800/80 px-3.5 py-1.5 rounded-full border border-indigo-300/60 shadow-2xs">
            <Compass className="h-4 w-4 text-indigo-600 animate-spin" />
            <span>Target: King Harsha's Assembly (7th C. CE)</span>
          </div>
        </div>
      </div>

      {/* 2D PHYSICAL EXPLORATION WORLD VIEWPORT */}
      <div className="relative rounded-3xl border-4 border-indigo-400/90 dark:border-indigo-700/80 bg-[#E0D8C8] dark:bg-[#1A1822] overflow-hidden shadow-2xl h-[460px] sm:h-[500px]">
        <div
          onClick={handleMapClick}
          className="absolute inset-0 cursor-crosshair overflow-hidden"
        >
          {/* Winding Pilgrimage Trail SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 stroke-amber-700 dark:stroke-amber-400 stroke-[8] stroke-dasharray-[12,8] fill-none">
            <path d="M 120 140 Q 250 320, 500 110 T 850 150" />
            <path d="M 200 320 Q 550 380, 850 150" />
          </svg>

          {/* Environmental Terrain Props */}
          <div className="absolute top-4 left-4 text-3xl opacity-70 pointer-events-none">⛵🌊 (Arrival Shore)</div>
          <div className="absolute bottom-4 left-4 text-3xl opacity-70 pointer-events-none">🌲🌲🌳</div>
          <div className="absolute top-4 right-4 text-3xl opacity-70 pointer-events-none">🏔️🏔️</div>
          <div className="absolute bottom-4 right-1/3 text-3xl opacity-70 pointer-events-none">🌾🌴</div>

          {/* 4 HISTORICAL MONUMENTS & COURTS */}
          {HISTORICAL_HALLS.map((hall) => (
            <div
              key={hall.id}
              style={{ left: `${hall.landmarkPos.x}%`, top: `${hall.landmarkPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-500 flex items-center justify-center text-3xl shadow-xl animate-pulse">
                {hall.landmarkIcon}
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 mt-1 rounded-full bg-indigo-950 text-white shadow-xs text-center max-w-[130px] leading-tight">
                {hall.rulerName}
              </span>
              <span className="text-[9px] text-amber-800 dark:text-amber-300 font-bold">
                {hall.dynastyAndEra}
              </span>
            </div>
          ))}

          {/* PLAYABLE XUANZANG CHARACTER */}
          <motion.div
            animate={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-2xl">
                📜
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-black/30 blur-[2px]" />
            </div>

            <span className="text-[10px] font-black text-white bg-indigo-950/90 px-2 py-0.5 rounded-full shadow-md mt-0.5 whitespace-nowrap">
              Xuanzang (Traveler)
            </span>
          </motion.div>
        </div>

        {/* Dynamic Travelling Overlay */}
        <AnimatePresence>
          {isTravellingScene && reachedHall && (
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
                📜🚶‍♂️🛕
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-black">
                Approaching {reachedHall.title}...
              </h3>
              <p className="text-xs text-indigo-200 max-w-sm">
                Crossing historical provinces, monasteries, and ancient learning halls.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arrival & Consequence Dialogue Modal */}
        <AnimatePresence>
          {showArrivalModal && reachedHall && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <div className="max-w-lg w-full bg-white dark:bg-card-dark rounded-3xl border-2 border-indigo-400 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
                <div className="text-5xl animate-bounce">
                  {reachedHall.isTargetCourt ? '🛕👑✨' : '🏛️📜'}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                    {reachedHall.title}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {reachedHall.isTargetCourt
                      ? 'Grand Reception by King Harshavardhana!'
                      : `Reached ${reachedHall.rulerName}`}
                  </h3>

                  <div className="mt-3 p-4 rounded-2xl bg-indigo-50 dark:bg-gray-800 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 border border-indigo-200 text-left italic leading-relaxed">
                    {reachedHall.courtDialogue}
                  </div>
                </div>

                {reachedHall.isTargetCourt ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Chapter 2 Complete: Pilgrimage Documented (+50 XP · ⭐ 1 Star)</span>
                    </div>

                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={onComplete}
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                      className="w-full shadow-md font-bold cursor-pointer"
                    >
                      Unlock Chapter 3: The Neolithic Settlements →
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleReturnToTrail}
                      leftIcon={<RotateCcw className="h-4 w-4" />}
                      className="w-full shadow-xs font-bold cursor-pointer"
                    >
                      Return to the Trail & Seek King Harsha
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-Screen D-Pad Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          📍 <strong>Current Position:</strong> ({Math.round(playerPos.x)}%, {Math.round(playerPos.y)}%) · Walk to any landmark to explore the historical era.
        </div>

        {/* D-Pad Buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => movePlayer(0, -12)}
            className="w-12 h-9 rounded-xl bg-indigo-100 dark:bg-gray-800 border border-indigo-300 text-indigo-900 dark:text-indigo-200 flex items-center justify-center font-bold hover:bg-indigo-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
            title="Move North"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => movePlayer(-12, 0)}
              className="w-12 h-9 rounded-xl bg-indigo-100 dark:bg-gray-800 border border-indigo-300 text-indigo-900 dark:text-indigo-200 flex items-center justify-center font-bold hover:bg-indigo-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move West"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 12)}
              className="w-12 h-9 rounded-xl bg-indigo-100 dark:bg-gray-800 border border-indigo-300 text-indigo-900 dark:text-indigo-200 flex items-center justify-center font-bold hover:bg-indigo-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move South"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(12, 0)}
              className="w-12 h-9 rounded-xl bg-indigo-100 dark:bg-gray-800 border border-indigo-300 text-indigo-900 dark:text-indigo-200 flex items-center justify-center font-bold hover:bg-indigo-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
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
