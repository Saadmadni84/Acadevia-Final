import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Heart,
  Activity,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface PulsePad {
  id: number;
  label: string;
  symbol: string;
  key: string;
  color: string;
  activeColor: string;
  soundFreq: number;
}

const PADS: PulsePad[] = [
  { id: 0, label: 'Cyan Pulse', symbol: '🔵', key: '1', color: 'bg-cyan-900/60 border-cyan-500/40 text-cyan-400', activeColor: 'bg-cyan-400 shadow-[0_0_30px_#22d3ee] border-white text-black', soundFreq: 261.63 },
  { id: 1, label: 'Amber Flare', symbol: '🟨', key: '2', color: 'bg-amber-900/60 border-amber-500/40 text-amber-400', activeColor: 'bg-amber-400 shadow-[0_0_30px_#fbbf24] border-white text-black', soundFreq: 329.63 },
  { id: 2, label: 'Crimson Surge', symbol: '🔺', key: '3', color: 'bg-rose-900/60 border-rose-500/40 text-rose-400', activeColor: 'bg-rose-500 shadow-[0_0_30px_#f43f5e] border-white text-black', soundFreq: 392.0 },
  { id: 3, label: 'Emerald Spark', symbol: '💎', key: '4', color: 'bg-emerald-900/60 border-emerald-500/40 text-emerald-400', activeColor: 'bg-emerald-400 shadow-[0_0_30px_#34d399] border-white text-black', soundFreq: 523.25 },
];

export const PatternPulse: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState<number>(0);
  const [activePadId, setActivePadId] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [statusText, setStatusText] = useState<string>('Press Start to Begin');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Audio tone generator
  const playTone = useCallback((freq: number, duration = 0.25) => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may be inactive before user interaction
    }
  }, [soundOn]);

  // Play sequence step by step
  const playSequence = useCallback(async (seq: number[]) => {
    setIsPlayingSequence(true);
    setStatusText('Observe the Pattern...');
    setPlayerIndex(0);

    const tempo = Math.max(300, 600 - seq.length * 30);

    for (let i = 0; i < seq.length; i++) {
      await new Promise((res) => setTimeout(res, 180));
      const padId = seq[i];
      setActivePadId(padId);
      playTone(PADS[padId].soundFreq, tempo / 1000);
      await new Promise((res) => setTimeout(res, tempo));
      setActivePadId(null);
    }

    setIsPlayingSequence(false);
    setStatusText('Your turn! Repeat the pulse.');
  }, [playTone]);

  // Start or advance round
  const advanceRound = useCallback((currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setRound(newSeq.length);
    playSequence(newSeq);
  }, [playSequence]);

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setStreak(0);
    const initial = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    setSequence(initial);
    setRound(2);
    playSequence(initial);
  };

  const handlePadClick = (padId: number) => {
    if (isPlayingSequence || gameState !== 'playing') return;

    setActivePadId(padId);
    playTone(PADS[padId].soundFreq, 0.2);
    setTimeout(() => setActivePadId(null), 200);

    if (padId === sequence[playerIndex]) {
      // Correct pad!
      const nextIndex = playerIndex + 1;
      setPlayerIndex(nextIndex);
      const addedPoints = 50 + streak * 10;
      setScore((prev) => prev + addedPoints);
      setStreak((prev) => prev + 1);

      if (nextIndex >= sequence.length) {
        // Completed this round!
        if (sequence.length >= 10) {
          // Mastered Pattern Pulse!
          setGameState('victory');
          if (user?.id) {
            gameService.saveGameScore({
              studentId: user.id,
              gameId: 'pattern-pulse',
              gameTitle: 'Pattern Pulse',
              score: score + 1000,
              accuracy: 100,
              timeSpent: 90,
              xpEarned: 150,
              metadata: { maxSequence: sequence.length },
            }).catch(console.error);
          }
        } else {
          setStatusText('Flawless! Expanding pattern...');
          setTimeout(() => advanceRound(sequence), 800);
        }
      }
    } else {
      // Wrong pad!
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setGameState('gameover');
      } else {
        setStatusText('Sequence interrupted! Replaying pattern...');
        setTimeout(() => playSequence(sequence), 1000);
      }
    }
  };

  // Keyboard shortcut listener (keys 1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handlePadClick(0);
      if (e.key === '2') handlePadClick(1);
      if (e.key === '3') handlePadClick(2);
      if (e.key === '4') handlePadClick(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
                Pattern Pulse
              </span>
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                Stage {round} / 10
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Sequential Pattern Recognition & Recall</p>
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

      {/* Main Pulse Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-slate-950 to-black border border-cyan-950/50 p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[460px]">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Prompt */}
        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center text-white mb-6">
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-bold text-gray-200">{statusText}</span>
          </div>
          {sequence.length > 0 && gameState === 'playing' && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {sequence.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx < playerIndex
                      ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                      : 'bg-gray-800 border border-white/10'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4 Interactive Neon Pulse Pads */}
        <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-6 max-w-sm w-full aspect-square my-auto">
          {PADS.map((pad) => {
            const isActive = activePadId === pad.id;

            return (
              <motion.button
                key={pad.id}
                type="button"
                whileHover={!isPlayingSequence && gameState === 'playing' ? { scale: 1.05 } : {}}
                whileTap={!isPlayingSequence && gameState === 'playing' ? { scale: 0.95 } : {}}
                onClick={() => handlePadClick(pad.id)}
                disabled={isPlayingSequence || gameState !== 'playing'}
                className={`relative rounded-3xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-150 ${
                  isActive ? pad.activeColor : pad.color
                } ${
                  isPlayingSequence || gameState !== 'playing' ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className="text-4xl sm:text-5xl filter drop-shadow-lg mb-2 select-none">
                  {pad.symbol}
                </span>
                <span className="text-xs font-black uppercase tracking-wider select-none">
                  {pad.label}
                </span>
                <span className="absolute bottom-2 right-3 text-[10px] font-mono opacity-60">
                  Key [{pad.key}]
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Center Start Button for Idle */}
        {gameState === 'idle' && (
          <div className="relative z-10 mt-6">
            <Button
              variant="gradient"
              size="lg"
              onClick={startGame}
              leftIcon={<Sparkles className="w-5 h-5 fill-white" />}
              className="px-8 font-bold shadow-xl shadow-primary/30"
            >
              Initiate Pulse Sequence
            </Button>
          </div>
        )}

        {/* Stage Footer */}
        <div className="relative z-10 w-full flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10 mt-6">
          <span>Keyboard shortcuts: [1] Blue, [2] Yellow, [3] Red, [4] Green</span>
          <span>Tempo: {Math.max(300, 600 - sequence.length * 30)}ms</span>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState === 'gameover' && (
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
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Sequence Desynced!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You reached Stage {round} with a final score of {score} pts.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={startGame} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Try Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Modal */}
      <AnimatePresence>
        {gameState === 'victory' && (
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
                  Pulse Maestro!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You reproduced a 10-step harmonic sequence with 100% precision!
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +150 XP Awarded • Final Score: {score}
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
