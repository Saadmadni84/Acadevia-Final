import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MagnetRescueGameProps {
  onComplete: () => void;
}

interface WorkshopItem {
  id: string;
  name: string;
  icon: string;
  isMagnetic: boolean;
  material: string;
  x: number; // percentage pos
  y: number;
  collected: boolean;
  attachedToMagnet: boolean;
}

const INITIAL_ITEMS: WorkshopItem[] = [
  { id: 'iron-nail-1', name: 'Iron Nail', icon: '🔩', isMagnetic: true, material: 'Iron', x: 20, y: 25, collected: false, attachedToMagnet: false },
  { id: 'wood-block', name: 'Wooden Block', icon: '🪵', isMagnetic: false, material: 'Wood', x: 35, y: 30, collected: false, attachedToMagnet: false },
  { id: 'steel-screw', name: 'Steel Screw', icon: '🪛', isMagnetic: true, material: 'Steel', x: 75, y: 20, collected: false, attachedToMagnet: false },
  { id: 'rubber-eraser', name: 'Rubber Eraser', icon: '🩹', isMagnetic: false, material: 'Rubber', x: 80, y: 40, collected: false, attachedToMagnet: false },
  { id: 'paper-clip', name: 'Steel Paperclip', icon: '📎', isMagnetic: true, material: 'Steel', x: 25, y: 70, collected: false, attachedToMagnet: false },
  { id: 'plastic-gear', name: 'Plastic Gear', icon: '⚙️', isMagnetic: false, material: 'Plastic', x: 65, y: 75, collected: false, attachedToMagnet: false },
  { id: 'iron-washer', name: 'Iron Washer', icon: '🧲', isMagnetic: true, material: 'Iron', x: 45, y: 80, collected: false, attachedToMagnet: false },
  { id: 'glass-marble', name: 'Glass Marble', icon: '🔮', isMagnetic: false, material: 'Glass', x: 15, y: 50, collected: false, attachedToMagnet: false },
];

export const MagnetRescueGame: React.FC<MagnetRescueGameProps> = ({ onComplete }) => {
  // Magnet Coordinates (percentage)
  const [magnetPos, setMagnetPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [items, setItems] = useState<WorkshopItem[]>(INITIAL_ITEMS);
  const [repairedMachinePercent, setRepairedMachinePercent] = useState(0);
  const [feedback, setFeedback] = useState<string>('Move the powerful horseshoe magnet near workshop items to discover which materials are magnetic!');
  const [testedPoles, setTestedPoles] = useState<boolean>(false);
  const [selectedPole, setSelectedPole] = useState<'N' | 'S'>('N');
  const [stationPole, setStationPole] = useState<'N' | 'S'>('S');

  // Repair Station Target Area: x: 80-98%, y: 75-95%
  const REPAIR_BOX = { minX: 75, maxX: 100, minY: 65, maxY: 100 };

  const magneticTotal = items.filter((i) => i.isMagnetic).length;
  const magneticCollected = items.filter((i) => i.isMagnetic && i.collected).length;
  const isMissionComplete = magneticCollected === magneticTotal && testedPoles;

  // Magnetic Attraction Physics Check
  const checkMagnetProximity = useCallback((mPos: { x: number; y: number }) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.collected) return item;

        const dist = Math.hypot(item.x - mPos.x, item.y - mPos.y);

        // Within attraction radius (14%)
        if (dist < 14) {
          if (item.isMagnetic) {
            setFeedback(`⚡ Attracted ${item.name}! (${item.material} is a magnetic material). Drag it to the Generator Repair Box!`);
            return { ...item, x: mPos.x, y: mPos.y, attachedToMagnet: true };
          } else {
            setFeedback(`❌ ${item.name} (${item.material}) does not respond. Non-magnetic materials are not attracted by magnets.`);
            return item;
          }
        }

        // If currently attached, drag along with magnet
        if (item.attachedToMagnet) {
          // Check if brought to Repair Box
          if (
            mPos.x >= REPAIR_BOX.minX &&
            mPos.x <= REPAIR_BOX.maxX &&
            mPos.y >= REPAIR_BOX.minY &&
            mPos.y <= REPAIR_BOX.maxY
          ) {
            setFeedback(`🔧 Fixed! Installed ${item.name} into the generator!`);
            return { ...item, collected: true, attachedToMagnet: false };
          }
          return { ...item, x: mPos.x, y: mPos.y };
        }

        return item;
      })
    );
  }, []);

  const moveMagnet = useCallback((dx: number, dy: number) => {
    setMagnetPos((prev) => {
      const nextX = Math.max(6, Math.min(94, prev.x + dx));
      const nextY = Math.max(6, Math.min(94, prev.y + dy));
      checkMagnetProximity({ x: nextX, y: nextY });
      return { x: nextX, y: nextY };
    });
  }, [checkMagnetProximity]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const STEP = 6;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveMagnet(0, -STEP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveMagnet(0, STEP);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveMagnet(-STEP, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveMagnet(STEP, 0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveMagnet]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(6, Math.min(94, clickX));
    const clampedY = Math.max(6, Math.min(94, clickY));

    setMagnetPos({ x: clampedX, y: clampedY });
    checkMagnetProximity({ x: clampedX, y: clampedY });
  };

  const handleTestPoles = () => {
    if (selectedPole === stationPole) {
      setFeedback(`🧲 Like Poles Repel! (${selectedPole} against ${stationPole}) pushes the magnetic test bar away!`);
    } else {
      setFeedback(`✨ Unlike Poles Attract! (${selectedPole} attracts ${stationPole}) locks the magnetic coupling into place!`);
      setTestedPoles(true);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 via-amber-50/40 to-red-50 dark:from-slate-900 dark:via-rose-950/20 dark:to-amber-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-3xl shadow-inner">
            🧲
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">
              Chapter 4 · Exploring Magnets
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Magnet Rescue Workshop
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Control the horseshoe magnet to recover all <strong>4 magnetic components</strong> (Iron & Steel) and test magnetic poles!
            </p>
          </div>
        </div>

        {/* Live Progress Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-rose-200 text-xs font-extrabold text-rose-800 dark:text-rose-200 shadow-2xs">
          <Zap className="h-4 w-4 text-rose-500 fill-rose-500" />
          <span>Components Fixed: {magneticCollected} / {magneticTotal}</span>
        </div>
      </div>

      {/* 2D PHYSICAL WORKSHOP EXPERIMENT VIEWPORT */}
      <div className="relative rounded-3xl border-4 border-rose-400/90 dark:border-rose-700/80 bg-[#F4EBE1] dark:bg-[#1C1717] overflow-hidden shadow-2xl h-[420px] sm:h-[460px]">
        {/* Clickable Workshop Floor Canvas */}
        <div onClick={handleCanvasClick} className="absolute inset-0 cursor-crosshair">
          {/* Grid Workbench Marking */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #e11d48 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Machine Generator Repair Box Target */}
          <div className="absolute right-3 bottom-3 w-44 h-36 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/50 p-2.5 flex flex-col justify-between pointer-events-none z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                ⚙️ Generator Station
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {Math.round((magneticCollected / magneticTotal) * 100)}%
              </span>
            </div>
            <div className="text-[10px] text-emerald-900 dark:text-emerald-200 font-medium">
              Drop recovered magnetic components here to repair!
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${(magneticCollected / magneticTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Scattered Items on Workshop Floor */}
          {items.map((item) => (
            <motion.div
              key={item.id}
              animate={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.collected ? 0.3 : 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md border-2 transition-transform',
                  item.collected
                    ? 'bg-emerald-100 border-emerald-400 scale-90'
                    : item.attachedToMagnet
                    ? 'bg-amber-200 border-amber-500 scale-110 animate-pulse'
                    : item.isMagnetic
                    ? 'bg-white dark:bg-gray-800 border-rose-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 opacity-85'
                )}
              >
                {item.icon}
              </div>
              <span className="text-[9px] font-black mt-0.5 px-1.5 py-0.2 rounded bg-black/70 text-white whitespace-nowrap">
                {item.name} ({item.material})
              </span>
            </motion.div>
          ))}

          {/* PLAYABLE MAGNET AVATAR */}
          <motion.div
            animate={{ left: `${magnetPos.x}%`, top: `${magnetPos.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 via-rose-500 to-red-700 border-2 border-white shadow-2xl flex items-center justify-center text-3xl">
                🧲
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-rose-400/60 animate-spin" />
            </div>
            <span className="text-[10px] font-black text-white bg-red-950/90 px-2 py-0.5 rounded-full shadow-md mt-0.5 whitespace-nowrap">
              Horseshoe Magnet
            </span>
          </motion.div>
        </div>
      </div>

      {/* Interactive Magnetic Pole Testing Station */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
            Magnetic Pole Coupling Station
          </span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white">
            Test Magnetic Poles (Attraction & Repulsion)
          </h4>
          <p className="text-xs text-gray-500">
            Station Target Pole: <span className="font-extrabold text-blue-600">[{stationPole} Pole]</span>. Select your magnet pole to couple:
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedPole('N')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black border-2 cursor-pointer transition-all',
              selectedPole === 'N' ? 'bg-red-600 text-white border-red-700' : 'bg-gray-100 text-gray-800 border-gray-300'
            )}
          >
            North [N]
          </button>
          <button
            type="button"
            onClick={() => setSelectedPole('S')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black border-2 cursor-pointer transition-all',
              selectedPole === 'S' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-800 border-gray-300'
            )}
          >
            South [S]
          </button>

          <Button
            size="sm"
            variant="gradient"
            onClick={handleTestPoles}
            className="cursor-pointer font-bold shadow-xs text-xs"
          >
            Test Poles ⚡
          </Button>
        </div>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 p-3.5 text-xs font-medium text-amber-950 dark:text-amber-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-amber-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">⚡🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Workshop Generator Repaired & Magnetism Mastered!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully separated magnetic materials (Iron & Steel) from non-magnetic materials (Wood, Rubber, Plastic, Glass) and verified that unlike magnetic poles attract (+35 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Magnet Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
