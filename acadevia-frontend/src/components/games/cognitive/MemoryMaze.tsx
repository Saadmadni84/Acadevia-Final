import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Heart,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Eye,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface Coord {
  x: number;
  y: number;
}

export const MemoryMaze: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [level, setLevel] = useState<number>(1);
  const [gridSize, setGridSize] = useState<number>(5);
  const [playerPos, setPlayerPos] = useState<Coord>({ x: 0, y: 0 });
  const [path, setPath] = useState<Coord[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<string[]>([]);
  const [phase, setPhase] = useState<'briefing' | 'memorizing' | 'navigating' | 'level-clear' | 'gameover' | 'victory'>('briefing');
  const [countdown, setCountdown] = useState<number>(4);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [trapTriggered, setTrapTriggered] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Tone synthesizer
  const playTone = useCallback((type: 'step' | 'trap' | 'win' | 'level') => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'step') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'trap') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'level') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1046.5, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // Audio context might be restricted
    }
  }, [soundOn]);

  // Generate self-avoiding random walk path from (0, 0) to (size-1, size-1)
  const generateMazePath = useCallback((size: number): Coord[] => {
    let current: Coord = { x: 0, y: 0 };
    const target: Coord = { x: size - 1, y: size - 1 };
    const visited: Coord[] = [{ ...current }];

    while (current.x !== target.x || current.y !== target.y) {
      const validMoves: Coord[] = [];
      const directions = [
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: -1 },
      ];

      for (const d of directions) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          if (!visited.some((v) => v.x === nx && v.y === ny)) {
            // Favor moves closer to target
            validMoves.push({ x: nx, y: ny });
          }
        }
      }

      if (validMoves.length === 0) {
        // Fallback: restart generation if boxed in
        return generateMazePath(size);
      }

      // Bias toward target
      validMoves.sort((a, b) => {
        const distA = Math.abs(a.x - target.x) + Math.abs(a.y - target.y);
        const distB = Math.abs(b.x - target.x) + Math.abs(b.y - target.y);
        return distA - distB + (Math.random() - 0.5);
      });

      current = validMoves[0];
      visited.push(current);
    }

    return visited;
  }, []);

  const startLevel = useCallback((lvl: number) => {
    const size = lvl === 1 ? 5 : lvl === 2 ? 5 : lvl === 3 ? 6 : 6;
    setGridSize(size);
    const newPath = generateMazePath(size);
    setPath(newPath);
    setPlayerPos({ x: 0, y: 0 });
    setRevealedTiles(['0,0']);
    setPhase('memorizing');
    setCountdown(Math.max(2.5, 4.5 - lvl * 0.3));
  }, [generateMazePath]);

  // Memorization countdown
  useEffect(() => {
    if (phase === 'memorizing') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('navigating');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Movement execution
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (phase !== 'navigating') return;

    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;

    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) return;

    const key = `${nx},${ny}`;
    const isOnPath = path.some((p) => p.x === nx && p.y === ny);

    if (isOnPath) {
      // Safe step!
      playTone('step');
      setPlayerPos({ x: nx, y: ny });
      setRevealedTiles((prev) => (prev.includes(key) ? prev : [...prev, key]));
      setScore((prev) => prev + 50);

      // Check if reached destination
      if (nx === gridSize - 1 && ny === gridSize - 1) {
        if (level >= 4) {
          playTone('win');
          setPhase('victory');
          if (user?.id) {
            gameService.saveGameScore({
              studentId: user.id,
              gameId: 'memory-maze',
              gameTitle: 'Memory Maze',
              score: score + 500,
              accuracy: 100,
              timeSpent: 110,
              xpEarned: 175,
              metadata: { levelsCleared: 4 },
            }).catch(console.error);
          }
        } else {
          playTone('level');
          setPhase('level-clear');
        }
      }
    } else {
      // Stepped on a trap!
      playTone('trap');
      setTrapTriggered(key);
      setTimeout(() => setTrapTriggered(null), 500);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setPhase('gameover');
      }
    }
  }, [phase, playerPos, gridSize, path, level, lives, score, user, playTone]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') movePlayer(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's') movePlayer(0, 1);
      if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') movePlayer(1, 0);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    startLevel(nextLvl);
  };

  const handleRestart = () => {
    setLevel(1);
    setLives(3);
    setScore(0);
    startLevel(1);
  };

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
                Memory Maze
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Floor {level} of 4
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Spatial Navigation & Fog-of-War Recall</p>
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

          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-rose-500 fill-rose-500' : 'text-gray-300 dark:text-gray-700'
                }`}
              />
            ))}
          </div>

          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
            <span className="text-lg font-black text-primary">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Dungeon Labyrinth Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-slate-950 to-black border border-emerald-950/50 p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-between min-h-[480px]">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status prompt */}
        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center text-white mb-4">
          {phase === 'memorizing' && (
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-bold text-amber-300">
                Memorize the Golden Path! ({countdown}s)
              </span>
            </div>
          )}
          {phase === 'navigating' && (
            <div className="flex items-center justify-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">
                Step through the dark! Reach the portal 🌀
              </span>
            </div>
          )}
          {phase === 'briefing' && (
            <span className="text-sm font-bold text-gray-300">
              The labyrinth conceals deadly traps. Trace the safe path in your mind!
            </span>
          )}
        </div>

        {/* Labyrinth Grid Container */}
        <div
          className="relative z-10 grid gap-2 my-auto p-3 bg-gray-900/60 rounded-3xl border border-gray-800 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: `${gridSize * 64}px`,
            maxWidth: '100%',
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const x = idx % gridSize;
            const y = Math.floor(idx / gridSize);
            const key = `${x},${y}`;

            const isPlayer = playerPos.x === x && playerPos.y === y;
            const isDestination = x === gridSize - 1 && y === gridSize - 1;
            const isStart = x === 0 && y === 0;
            const isPathTile = path.some((p) => p.x === x && p.y === y);
            const isRevealed = revealedTiles.includes(key);
            const isMemorizePhase = phase === 'memorizing';
            const isTrapFlashed = trapTriggered === key;

            return (
              <div
                key={idx}
                className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                  isTrapFlashed
                    ? 'bg-rose-900/80 border-rose-500 animate-bounce'
                    : isPlayer
                    ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_15px_#10b981]'
                    : isMemorizePhase && isPathTile
                    ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_12px_#f59e0b]'
                    : isRevealed && isPathTile
                    ? 'bg-emerald-950/40 border-emerald-600/40'
                    : 'bg-gray-950/80 border-gray-800/80'
                }`}
              >
                {/* Tile Contents */}
                {isPlayer ? (
                  <motion.div
                    layoutId="player"
                    className="text-2xl filter drop-shadow-md select-none"
                  >
                    🧙‍♂️
                  </motion.div>
                ) : isDestination ? (
                  <span className="text-2xl animate-spin select-none">🌀</span>
                ) : isStart ? (
                  <span className="text-xs font-mono font-bold text-gray-500">START</span>
                ) : isMemorizePhase && isPathTile ? (
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                ) : isRevealed && isPathTile ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                ) : isTrapFlashed ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* On-screen D-Pad Controls for Mobile & Accessibility */}
        {phase === 'navigating' && (
          <div className="relative z-10 flex flex-col items-center gap-1.5 mt-4">
            <button
              type="button"
              onClick={() => movePlayer(0, -1)}
              className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white border border-white/10 active:scale-95 transition"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => movePlayer(-1, 0)}
                className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white border border-white/10 active:scale-95 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => movePlayer(0, 1)}
                className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white border border-white/10 active:scale-95 transition"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => movePlayer(1, 0)}
                className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white border border-white/10 active:scale-95 transition"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Start Briefing Button */}
        {phase === 'briefing' && (
          <div className="relative z-10 mt-6">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => startLevel(1)}
              leftIcon={<Sparkles className="w-5 h-5 fill-white" />}
              className="px-8 font-bold shadow-xl shadow-primary/30"
            >
              Enter Labyrinth Floor 1
            </Button>
          </div>
        )}

        {/* Stage Footer */}
        <div className="relative z-10 w-full flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10 mt-6">
          <span>Navigate with Arrow keys, WASD, or on-screen D-pad</span>
          <span>Trap penalty: 1 Life lost per misstep</span>
        </div>
      </div>

      {/* Level Clear Modal */}
      <AnimatePresence>
        {phase === 'level-clear' && (
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Floor {level} Conquered!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You safely crossed the labyrinth without losing your bearings.
                </p>
              </div>
              <Button
                variant="gradient"
                size="lg"
                onClick={handleNextLevel}
                className="w-full font-bold shadow-lg"
              >
                Descend to Floor {level + 1}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {phase === 'gameover' && (
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
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Lost in the Labyrinth!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Traps claimed all lives on Floor {level}. Final score: {score} pts.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Try Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Modal */}
      <AnimatePresence>
        {phase === 'victory' && (
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
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Labyrinth Master!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You conquered all 4 labyrinth floors and escaped the fog-of-war!
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +175 XP Awarded • Final Score: {score}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
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
