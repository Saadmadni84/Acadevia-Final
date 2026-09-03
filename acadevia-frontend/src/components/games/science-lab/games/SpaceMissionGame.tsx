import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Info, Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SpaceMissionGameProps {
  onComplete: () => void;
}

interface CelestialTarget {
  id: 'earth' | 'moon' | 'space_station' | 'sun';
  name: string;
  icon: string;
  pos: { x: number; y: number };
  scanned: boolean;
  scanLog: string;
  isHazard: boolean;
}

const CELESTIAL_TARGETS: CelestialTarget[] = [
  { id: 'earth', name: 'Planet Earth', icon: '🌍', pos: { x: 25, y: 70 }, scanned: false, scanLog: 'Earth: The only known planet with water, breathable atmosphere, and life.', isHazard: false },
  { id: 'moon', name: 'The Moon', icon: '🌕', pos: { x: 45, y: 30 }, scanned: false, scanLog: 'Moon: Earth’s natural satellite with impact craters and no atmosphere.', isHazard: false },
  { id: 'space_station', name: 'Orbital Research Station', icon: '🛰️', pos: { x: 75, y: 75 }, scanned: false, scanLog: 'Space Station: Microgravity laboratory orbiting Earth.', isHazard: false },
  { id: 'sun', name: 'The Sun', icon: '☀️', pos: { x: 80, y: 20 }, scanned: false, scanLog: 'WARNING: The Sun is a super-hot star generating solar radiation! Keep safe distance.', isHazard: true },
];

export const SpaceMissionGame: React.FC<SpaceMissionGameProps> = ({ onComplete }) => {
  const [shipPos, setShipPos] = useState<{ x: number; y: number }>({ x: 20, y: 40 });
  const [targets, setTargets] = useState<CelestialTarget[]>(CELESTIAL_TARGETS);
  const [feedback, setFeedback] = useState<string>(
    'Orbital Space Flight: Pilot the spacecraft using WASD / Arrow Keys or tap the cosmic viewport to scan Earth, the Moon, and dock with the Space Station (Beware of approaching too close to the hot Sun)!'
  );
  const [solarWarning, setSolarWarning] = useState(false);

  const scannedCount = targets.filter((t) => !t.isHazard && t.scanned).length;
  const isMissionComplete = scannedCount === 3;

  const checkProximity = useCallback((pos: { x: number; y: number }) => {
    // Check Sun Hazard
    const sunDist = Math.hypot(pos.x - 80, pos.y - 20);
    if (sunDist < 18) {
      setSolarWarning(true);
      setFeedback('⚠️ CRITICAL THERMAL WARNING: Approaching too close to the Sun’s high radiation! Turn back immediately!');
    } else {
      setSolarWarning(false);
    }

    // Check Safe Targets
    setTargets((prev) =>
      prev.map((t) => {
        if (t.isHazard || t.scanned) return t;
        const dist = Math.hypot(pos.x - t.pos.x, pos.y - t.pos.y);
        if (dist < 14) {
          setFeedback(`✨ Scientific Scan Complete: ${t.scanLog}`);
          return { ...t, scanned: true };
        }
        return t;
      })
    );
  }, []);

  const moveShip = useCallback((dx: number, dy: number) => {
    setShipPos((prev) => {
      const nextX = Math.max(6, Math.min(94, prev.x + dx));
      const nextY = Math.max(6, Math.min(94, prev.y + dy));
      checkProximity({ x: nextX, y: nextY });
      return { x: nextX, y: nextY };
    });
  }, [checkProximity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const STEP = 6;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveShip(0, -STEP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveShip(0, STEP);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveShip(-STEP, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveShip(STEP, 0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveShip]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(6, Math.min(94, clickX));
    const clampedY = Math.max(6, Math.min(94, clickY));

    setShipPos({ x: clampedX, y: clampedY });
    checkProximity({ x: clampedX, y: clampedY });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-slate-900 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner">
            🚀
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
              Chapter 12 · Beyond Earth: Solar System & Space
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Orbital Space Exploration Mission
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Navigate your research spacecraft to collect scientific data from <strong>Earth</strong>, <strong>the Moon</strong>, and the <strong>Space Station</strong>!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-indigo-200 text-xs font-extrabold text-indigo-800 dark:text-indigo-200 shadow-2xs">
          <Rocket className="h-4 w-4 text-indigo-600" />
          <span>Celestial Data: {scannedCount} / 3</span>
        </div>
      </div>

      {/* 2D COSMIC SPACE VIEWPORT */}
      <div className="relative rounded-3xl border-4 border-indigo-500/90 dark:border-indigo-700/80 bg-[#0B0D1B] overflow-hidden shadow-2xl h-[420px] sm:h-[460px]">
        {/* Clickable Space Canvas */}
        <div onClick={handleCanvasClick} className="absolute inset-0 cursor-crosshair">
          {/* Starfield Particles */}
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Celestial Bodies */}
          {targets.map((target) => (
            <div
              key={target.id}
              style={{ left: `${target.pos.x}%`, top: `${target.pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl border-2 transition-transform',
                  target.isHazard
                    ? 'bg-amber-500/30 border-amber-500 ring-8 ring-amber-500/20 animate-pulse'
                    : target.scanned
                    ? 'bg-emerald-500/30 border-emerald-400'
                    : 'bg-indigo-900/60 border-indigo-400'
                )}
              >
                {target.icon}
              </div>
              <span className="text-[10px] font-black text-white bg-black/80 px-2 py-0.5 rounded-full mt-1">
                {target.name} {target.scanned ? '✓' : ''}
              </span>
            </div>
          ))}

          {/* PLAYABLE RESEARCH SPACECRAFT */}
          <motion.div
            animate={{ left: `${shipPos.x}%`, top: `${shipPos.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-sky-400 to-indigo-700 border-2 border-white shadow-2xl flex items-center justify-center text-2xl">
              🚀
            </div>
            <span className="text-[9px] font-black text-white bg-indigo-950 px-2 py-0.5 rounded-full mt-0.5">
              Orbiter-1
            </span>
          </motion.div>
        </div>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/40 p-3.5 text-xs font-medium text-indigo-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-indigo-400 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">🚀🌍🌕🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Celestial Space Exploration Mission Accomplished!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully piloted the orbiter around the Earth-Moon orbital system and docked at the space station while maintaining safe distance from the solar radiation corona (+45 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Space Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
