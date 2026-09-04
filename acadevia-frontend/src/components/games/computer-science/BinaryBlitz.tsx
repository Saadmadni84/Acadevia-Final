import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Binary, Heart, Award, Sparkles, RotateCcw, Zap, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

const BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

interface TargetWave {
  id: number;
  targetDecimal: number;
  targetHex: string;
  timeLimit: number; // in seconds
  points: number;
}

export const BinaryBlitz: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 8-bit register state [b7, b6, b5, b4, b3, b2, b1, b0]
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  // Current value formed by bits
  const currentDecimal = bits.reduce((sum, bit, idx) => sum + bit * BIT_VALUES[idx], 0);

  // Game loop state
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [waveCount, setWaveCount] = useState(1);
  const [currentTarget, setCurrentTarget] = useState<number>(15);
  const [targetHex, setTargetHex] = useState<string>('0x0F');
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; positive: boolean } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Generate a new target number adapted to difficulty
  const generateNewTarget = useCallback((wave: number) => {
    let newTarget = 0;
    if (wave <= 3) {
      // First 4 bits only (0 to 15)
      newTarget = Math.floor(Math.random() * 15) + 1;
    } else if (wave <= 7) {
      // Up to 63
      newTarget = Math.floor(Math.random() * 63) + 1;
    } else {
      // Full 8-bit (up to 255)
      newTarget = Math.floor(Math.random() * 255) + 1;
    }

    setCurrentTarget(newTarget);
    setTargetHex('0x' + newTarget.toString(16).toUpperCase().padStart(2, '0'));
    setTimeRemaining(Math.max(8, 16 - Math.floor(wave / 3)));
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  }, []);

  // Timer countdown loop
  useEffect(() => {
    if (isGameOver || showExitConfirm) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timeout: lose a life
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
            }
            return nextL;
          });
          setStreak(0);
          setFeedback({ text: `⏳ Time Expired! Target was ${currentTarget}`, positive: false });
          generateNewTarget(waveCount);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, showExitConfirm, waveCount, currentTarget, generateNewTarget]);

  // Check if current decimal matches target
  useEffect(() => {
    if (currentDecimal === currentTarget && currentTarget > 0 && !isGameOver) {
      const bonus = streak * 20;
      const pts = 100 + bonus;
      setScore((s) => s + pts);
      setStreak((st) => st + 1);
      setFeedback({ text: `⚡ MATCH! +${pts} pts (Combo x${streak + 1})`, positive: true });

      const nextWave = waveCount + 1;
      setWaveCount(nextWave);

      // Submit score incrementally
      gameService.submitScore('binary-blitz', { score: pts, timeTaken: 15 - timeRemaining }).catch(() => {});

      generateNewTarget(nextWave);
    }
  }, [currentDecimal, currentTarget, isGameOver, streak, timeRemaining, waveCount, generateNewTarget]);

  // Toggle a bit
  const toggleBit = (index: number) => {
    if (isGameOver) return;
    setBits((prev) => {
      const copy = [...prev];
      copy[index] = copy[index] === 1 ? 0 : 1;
      return copy;
    });
  };

  // Keyboard shortcut listener (keys 1 to 8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        toggleBit(num - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setLives(3);
    setWaveCount(1);
    setIsGameOver(false);
    setFeedback(null);
    generateNewTarget(1);
  };

  const handleExit = () => {
    navigate(ROUTES.GAMES);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 select-none">
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
            <Binary className="h-4 w-4 text-emerald-500" />
            <span>Binary Blitz</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold">
              Wave {waveCount}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          {/* Lives */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300 dark:text-gray-700'}`}
              />
            ))}
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Screen */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-black shadow-2xl p-6 sm:p-8 space-y-6">
        {/* CRT Scanline & Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Target Display Hub */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 sm:p-6 backdrop-blur-md">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
              Target Decimal Value:
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight text-shadow">
                {currentTarget}
              </span>
              <span className="text-sm font-mono text-emerald-400 font-bold">
                (Hex: {targetHex})
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <span className="text-[11px] font-mono text-gray-400 block uppercase">Time Remaining:</span>
            <span className={`text-3xl sm:text-4xl font-mono font-extrabold ${timeRemaining <= 4 ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
              {timeRemaining}s
            </span>
            <div className="w-28 sm:w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1 mx-auto sm:ml-auto">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${(timeRemaining / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Register Value HUD */}
        <div className="relative z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-xs font-mono">
          <span className="text-gray-400">Current Sum:</span>
          <span className={`text-xl font-extrabold ${currentDecimal === currentTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
            {currentDecimal} / {currentTarget}
          </span>
          <span className="text-gray-500">
            {currentDecimal < currentTarget ? `Need +${currentTarget - currentDecimal}` : currentDecimal > currentTarget ? `Over by -${currentDecimal - currentTarget}` : 'EQUAL!'}
          </span>
        </div>

        {/* 8-Bit Interactive Switches Array */}
        <div className="relative z-10 grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {BIT_VALUES.map((weight, idx) => {
            const isActive = bits[idx] === 1;
            return (
              <button
                key={weight}
                type="button"
                onClick={() => toggleBit(idx)}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/30 text-emerald-300 scale-105'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="text-[10px] font-mono text-gray-500 mb-1">
                  Bit {7 - idx} (Key {idx + 1})
                </span>
                <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white">
                  2^{7 - idx} = {weight}
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono my-2 text-white">
                  {bits[idx]}
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                  {isActive ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`text-center py-2 px-4 rounded-xl text-xs font-mono font-bold ${
              feedback.positive
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 animate-bounce'
                : 'bg-red-950/60 text-red-300 border border-red-500/40'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Educational Hint Footer */}
        <div className="text-[11px] font-mono text-gray-500 text-center pt-2 border-t border-gray-900">
          💡 Pro-Tip: Turn on the highest powers of 2 first that fit into {currentTarget}, then activate the remainder!
        </div>

        {/* Game Over Screen */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-30 space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                <Zap className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-red-400 font-mono">System Crash!</h3>
              <p className="text-sm text-gray-300 max-w-sm">
                You survived {waveCount - 1} binary waves and scored {score} points!
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleRestart}
                  className="bg-emerald-500 hover:bg-emerald-600 font-bold px-6 py-2.5 rounded-xl text-black shadow-lg"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExit}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Exit to Games
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Binary Blitz?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your high score of {score} pts will be saved to your profile leaderboard.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Stay Playing
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
