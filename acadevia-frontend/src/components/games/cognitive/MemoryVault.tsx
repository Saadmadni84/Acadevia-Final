import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Heart,
  Timer,
  Eye,
  Zap,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

const VAULT_ITEMS = [
  { id: 'goblet', name: 'Golden Chalice', icon: '🏆', color: 'text-amber-400' },
  { id: 'scarab', name: 'Emerald Scarab', icon: '🪲', color: 'text-emerald-400' },
  { id: 'scepter', name: 'Royal Scepter', icon: '🪄', color: 'text-purple-400' },
  { id: 'scroll', name: 'Ancient Codex', icon: '📜', color: 'text-amber-200' },
  { id: 'crystal', name: 'Sapphire Prism', icon: '💎', color: 'text-cyan-400' },
  { id: 'crown', name: 'Imperial Crown', icon: '👑', color: 'text-yellow-400' },
  { id: 'ring', name: 'Signet Ring', icon: '💍', color: 'text-pink-400' },
  { id: 'hourglass', name: 'Chrono Sands', icon: '⏳', color: 'text-orange-400' },
  { id: 'key', name: 'Obsidian Key', icon: '🗝️', color: 'text-stone-300' },
];

interface PedestalSlot {
  slotId: number;
  item: typeof VAULT_ITEMS[0] | null;
}

export const MemoryVault: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(1);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Phase: 'briefing' | 'memorizing' | 'recalling' | 'round-success' | 'game-over' | 'victory'
  const [phase, setPhase] = useState<string>('briefing');
  const [memorizeCountdown, setMemorizeCountdown] = useState<number>(4);
  const [pedestals, setPedestals] = useState<PedestalSlot[]>([]);
  const [targetSequence, setTargetSequence] = useState<typeof VAULT_ITEMS[0][]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedSlots, setRevealedSlots] = useState<number[]>([]);
  const [shakingSlot, setShakingSlot] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sound effect simulator using Web Audio API
  const playSound = useCallback((type: 'success' | 'error' | 'bell' | 'win') => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundOn]);

  // Generate level setup
  const startLevel = useCallback((lvl: number) => {
    // Number of active relics: 3 for lvl 1, up to 7 for lvl 5
    const numItems = Math.min(3 + lvl - 1, 7);
    const shuffledItems = [...VAULT_ITEMS].sort(() => Math.random() - 0.5).slice(0, numItems);

    // 9 pedestals total in a 3x3 grid
    const slotIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    const newPedestals: PedestalSlot[] = Array.from({ length: 9 }, (_, i) => ({
      slotId: i,
      item: null,
    }));

    shuffledItems.forEach((item, idx) => {
      newPedestals[slotIndexes[idx]].item = item;
    });

    setPedestals(newPedestals);
    setTargetSequence(shuffledItems);
    setCurrentStep(0);
    setRevealedSlots([]);
    setPhase('memorizing');
    setMemorizeCountdown(Math.max(2.5, 5 - lvl * 0.4));
    playSound('bell');
  }, [playSound]);

  // Memorization countdown timer
  useEffect(() => {
    if (phase === 'memorizing') {
      timerRef.current = setInterval(() => {
        setMemorizeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setPhase('recalling');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase]);

  const handlePedestalClick = (slotId: number) => {
    if (phase !== 'recalling') return;
    if (revealedSlots.includes(slotId)) return;

    const clickedPedestal = pedestals[slotId];
    const expectedItem = targetSequence[currentStep];

    if (clickedPedestal.item?.id === expectedItem.id) {
      // Correct pedestal!
      playSound('success');
      const nextStep = currentStep + 1;
      setRevealedSlots((prev) => [...prev, slotId]);
      setCurrentStep(nextStep);
      setScore((prev) => prev + 100 * combo);
      setCombo((prev) => Math.min(prev + 1, 5));

      if (nextStep >= targetSequence.length) {
        // Level cleared!
        playSound('win');
        if (level >= 5) {
          setPhase('victory');
          if (user?.id) {
            gameService.saveGameScore({
              studentId: user.id,
              gameId: 'memory-vault',
              gameTitle: 'Memory Vault',
              score: score + 500,
              accuracy: 100,
              timeSpent: 120,
              xpEarned: 160,
              metadata: { completed: true },
            }).catch(console.error);
          }
        } else {
          setPhase('round-success');
        }
      }
    } else {
      // Incorrect pedestal!
      playSound('error');
      setShakingSlot(slotId);
      setTimeout(() => setShakingSlot(null), 500);
      setCombo(1);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setPhase('game-over');
      }
    }
  };

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    startLevel(nextLvl);
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setCombo(1);
    startLevel(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Status HUD */}
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
                Memory Vault
              </span>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                Chamber {level} of 5
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Cognitive Working Memory & Recall</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title={soundOn ? 'Mute sound' : 'Enable sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

          {/* Lives */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-rose-500 fill-rose-500' : 'text-gray-300 dark:text-gray-700'
                } transition-colors`}
              />
            ))}
          </div>

          {/* Multiplier & Score */}
          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
            <div className="flex items-center gap-1.5 justify-end">
              {combo > 1 && (
                <span className="text-xs font-black text-amber-500 px-1.5 py-0.2 rounded-md bg-amber-500/10">
                  {combo}x
                </span>
              )}
              <span className="text-lg font-black text-primary">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chamber Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-slate-900 to-black border border-purple-950/60 p-6 sm:p-8 shadow-2xl min-h-[460px] flex flex-col justify-between">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Phase HUD / Instructions Banner */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white">
          {phase === 'memorizing' && (
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <span className="text-sm font-bold text-amber-300">Memorize the chamber relics!</span>
                <p className="text-xs text-gray-300">They will vanish in {memorizeCountdown}s...</p>
              </div>
            </div>
          )}

          {phase === 'recalling' && (
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-cyan-400 animate-bounce" />
              <div>
                <span className="text-sm font-bold text-cyan-300">
                  Recall Target {currentStep + 1} of {targetSequence.length}:
                </span>
                <span className="ml-2 text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                  {targetSequence[currentStep]?.name} ({targetSequence[currentStep]?.icon})
                </span>
              </div>
            </div>
          )}

          {phase === 'briefing' && (
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-gray-200">
                Step into the ancient vault. Test your memory retention across 5 trial chambers!
              </span>
            </div>
          )}

          {/* Memorization Progress Bar */}
          {phase === 'memorizing' && (
            <div className="w-32 bg-gray-800 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-rose-400 h-full transition-all duration-1000"
                style={{ width: `${(memorizeCountdown / 4) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* 3x3 Chamber Vault Grid */}
        <div className="relative z-10 my-6 max-w-md mx-auto w-full grid grid-cols-3 gap-3 sm:gap-4 aspect-square">
          {pedestals.map((pedestal) => {
            const isRevealed = revealedSlots.includes(pedestal.slotId);
            const isMemorizePhase = phase === 'memorizing';
            const showItem = isMemorizePhase || isRevealed;
            const isShaking = shakingSlot === pedestal.slotId;

            return (
              <motion.button
                key={pedestal.slotId}
                type="button"
                whileHover={phase === 'recalling' && !isRevealed ? { scale: 1.05 } : {}}
                whileTap={phase === 'recalling' && !isRevealed ? { scale: 0.95 } : {}}
                onClick={() => handlePedestalClick(pedestal.slotId)}
                className={`relative rounded-2xl border flex flex-col items-center justify-center p-3 transition-all duration-300 ${
                  isShaking ? 'animate-bounce border-rose-500 bg-rose-950/40' : ''
                } ${
                  isRevealed
                    ? 'bg-purple-900/40 border-purple-500/60 shadow-lg shadow-purple-500/20'
                    : isMemorizePhase && pedestal.item
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/15'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Pedestal Top Ring */}
                <div className="absolute inset-2 rounded-xl border border-white/5 pointer-events-none" />

                {showItem && pedestal.item ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center justify-center space-y-1"
                  >
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
                      {pedestal.item.icon}
                    </span>
                    <span className="text-[9px] font-bold text-gray-300 select-none text-center line-clamp-1">
                      {pedestal.item.name}
                    </span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-600">
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-mono">Slot {pedestal.slotId + 1}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Start Briefing Button */}
        {phase === 'briefing' && (
          <div className="relative z-10 flex justify-center">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => startLevel(1)}
              leftIcon={<Sparkles className="w-5 h-5 fill-white" />}
              className="px-8 font-bold shadow-xl shadow-primary/30"
            >
              Enter Chamber 1
            </Button>
          </div>
        )}

        {/* Stage Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
          <span>Target Accuracy: Progressive Spatial Chunking</span>
          <span>Adaptive Memory Load: {pedestals.filter((p) => p.item).length} Relics</span>
        </div>
      </div>

      {/* Round Success Modal */}
      <AnimatePresence>
        {phase === 'round-success' && (
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
                <Unlock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Chamber {level} Unlocked!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Flawless recall! Next chamber expands memory load and relics.
                </p>
              </div>
              <Button
                variant="gradient"
                size="lg"
                onClick={handleNextLevel}
                className="w-full font-bold shadow-lg"
              >
                Proceed to Chamber {level + 1}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {phase === 'game-over' && (
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
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Vault Sealed!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You ran out of lives in Chamber {level}. Final score: {score} pts.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Retry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Victory Modal */}
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
                  Master Vault Conquered!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You conquered all 5 chambers and retrieved the legendary relics!
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +160 XP Earned • Final Score: {score}
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
