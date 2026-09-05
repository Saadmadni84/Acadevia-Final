import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Target,
  Flame,
  Zap,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface TargetItem {
  id: number;
  symbol: string;
  name: string;
  isTarget: boolean;
  x: number; // percentage 5-90%
  y: number; // percentage 10-85%
  size: number;
  vx: number;
  vy: number;
}

const SHAPES = [
  { symbol: '💎', name: 'Sapphire Prism' },
  { symbol: '⚡', name: 'Golden Spark' },
  { symbol: '🎯', name: 'Bullseye' },
  { symbol: '⭐', name: 'Radiant Star' },
  { symbol: '🔥', name: 'Solar Flare' },
  { symbol: '🧿', name: 'Mystic Eye' },
];

export const FocusHunter: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [gameState, setGameState] = useState<'briefing' | 'playing' | 'finished'>('briefing');
  const [currentTarget, setCurrentTarget] = useState<typeof SHAPES[0]>(SHAPES[0]);
  const [items, setItems] = useState<TargetItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [targetsHit, setTargetsHit] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  const requestRef = useRef<number | null>(null);

  // Tone synthesizer
  const playTone = useCallback((type: 'hit' | 'miss' | 'end') => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hit') {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'miss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'end') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio context might be restricted
    }
  }, [soundOn]);

  // Spawn pool of floating objects
  const spawnItems = useCallback((targetShape: typeof SHAPES[0]) => {
    const newItems: TargetItem[] = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const isTarget = Math.random() < 0.35; // ~35% targets
      const shape = isTarget
        ? targetShape
        : SHAPES.filter((s) => s.symbol !== targetShape.symbol)[
            Math.floor(Math.random() * (SHAPES.length - 1))
          ];

      newItems.push({
        id: Math.random(),
        symbol: shape.symbol,
        name: shape.name,
        isTarget,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        size: Math.random() * 12 + 32,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    // Ensure at least 3 targets are present
    const targetsCount = newItems.filter((it) => it.isTarget).length;
    if (targetsCount < 3) {
      for (let j = 0; j < 3 - targetsCount; j++) {
        newItems[j].isTarget = true;
        newItems[j].symbol = targetShape.symbol;
        newItems[j].name = targetShape.name;
      }
    }

    setItems(newItems);
  }, []);

  const startGame = () => {
    const initialTarget = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setCurrentTarget(initialTarget);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(45);
    setTargetsHit(0);
    setGameState('playing');
    spawnItems(initialTarget);
  };

  // Game loop for moving items
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTime) / 16;
      lastTime = time;

      setItems((prev) =>
        prev.map((item) => {
          let nx = item.x + item.vx * dt;
          let ny = item.y + item.vy * dt;
          let nvx = item.vx;
          let nvy = item.vy;

          if (nx <= 2 || nx >= 90) nvx = -nvx;
          if (ny <= 5 || ny >= 85) nvy = -nvy;

          return {
            ...item,
            x: Math.max(2, Math.min(90, nx)),
            y: Math.max(5, Math.min(85, ny)),
            vx: nvx,
            vy: nvy,
          };
        })
      );

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  // Round countdown timer & periodic target shifts
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('finished');
          playTone('end');
          return 0;
        }

        // Shift target every 15 seconds to test cognitive adaptability
        if (prev % 15 === 0) {
          const nextTarget = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          setCurrentTarget(nextTarget);
          spawnItems(nextTarget);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, playTone, spawnItems]);

  // Handle item tap
  const handleItemClick = (item: TargetItem) => {
    if (gameState !== 'playing') return;

    if (item.isTarget) {
      // Hit correct target!
      playTone('hit');
      const pts = 100 * multiplier;
      setScore((prev) => prev + pts);
      setTargetsHit((prev) => prev + 1);

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 12) setMultiplier(5);
      else if (newStreak >= 8) setMultiplier(4);
      else if (newStreak >= 5) setMultiplier(3);
      else if (newStreak >= 3) setMultiplier(2);
      else setMultiplier(1);

      // Respawn this target at a new position
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === item.id) {
            return {
              ...it,
              id: Math.random(),
              x: Math.random() * 80 + 5,
              y: Math.random() * 70 + 10,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
            };
          }
          return it;
        })
      );
    } else {
      // Clicked a distractor!
      playTone('miss');
      setStreak(0);
      setMultiplier(1);
      setScore((prev) => Math.max(0, prev - 50));
    }
  };

  // Submit score on finish
  useEffect(() => {
    if (gameState === 'finished' && user?.id) {
      gameService.saveGameScore({
        studentId: user.id,
        gameId: 'focus-hunter',
        gameTitle: 'Focus Hunter',
        score,
        accuracy: Math.min(100, Math.round((targetsHit / 40) * 100)),
        timeSpent: 45,
        xpEarned: 165,
        metadata: { targetsHit },
      }).catch(console.error);
    }
  }, [gameState, score, targetsHit, user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-5 py-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.GAMES)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-gray-200 dark:border-gray-700"
          >
            Exit Game
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                Focus Hunter
              </span>
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/20">
                Cognitive Attention Arena
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Selective Observation & Distractor Suppression</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

          {/* Timer countdown */}
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
            <Timer className="w-4 h-4 text-amber-500" />
            <span>{timeLeft}s</span>
          </div>

          {/* Multiplier & Score */}
          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
            <div className="flex items-center gap-1.5 justify-end">
              {multiplier > 1 && (
                <span className="text-xs font-black text-rose-500 px-1.5 py-0.2 rounded-md bg-rose-500/10">
                  {multiplier}x 🔥
                </span>
              )}
              <span className="text-lg font-black text-primary">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Observation Arena */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-slate-950 to-black border border-rose-950/50 p-6 sm:p-8 shadow-2xl flex flex-col justify-between h-[520px]">
        {/* Target Reticle Banner */}
        <div className="relative z-10 flex items-center justify-between bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-rose-400 animate-spin" />
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Primary Target Symbol:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTarget.symbol}</span>
                <span className="text-base font-extrabold text-white">{currentTarget.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-300">
            <span className="bg-white/10 px-3 py-1 rounded-xl">Hits: {targetsHit}</span>
            <span className="bg-white/10 px-3 py-1 rounded-xl">Streak: {streak}</span>
          </div>
        </div>

        {/* Dynamic Drifting Field */}
        <div className="relative z-0 flex-1 overflow-hidden select-none">
          {gameState === 'playing' &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  fontSize: `${item.size}px`,
                  transition: 'transform 0.05s linear',
                }}
                className="transform -translate-x-1/2 -translate-y-1/2 cursor-pointer filter drop-shadow-md hover:scale-125 active:scale-90 select-none transition-transform"
              >
                {item.symbol}
              </button>
            ))}

          {/* Briefing Start View */}
          {gameState === 'briefing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <Target className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-white">Cognitive Focus Trial</h3>
                <p className="text-xs text-gray-400">
                  Target symbols drift amidst deceptive decoys. Tap only matching targets quickly to rack up streak multipliers!
                </p>
              </div>
              <Button
                variant="gradient"
                size="lg"
                onClick={startGame}
                leftIcon={<Sparkles className="w-5 h-5 fill-white" />}
                className="px-8 font-bold shadow-xl shadow-primary/30"
              >
                Engage Target Field
              </Button>
            </div>
          )}
        </div>

        {/* Arena Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/10">
          <span>Tap targets immediately. Avoid distractors to protect streak.</span>
          <span>Target switches dynamically every 15s</span>
        </div>
      </div>

      {/* Finished Summary Modal */}
      <AnimatePresence>
        {gameState === 'finished' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Trial Complete!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You eliminated {targetsHit} targets with peak accuracy.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +165 XP Earned • Final Score: {score}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={startGame} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Play Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
