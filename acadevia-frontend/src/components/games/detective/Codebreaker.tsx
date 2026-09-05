import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  KeyRound,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface GuessRecord {
  digits: number[];
  greenPins: number; // correct digit in correct place
  amberPins: number; // correct digit in wrong place
}

export const Codebreaker: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Secret 4-digit code with unique digits between 1-9
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([1, 2, 3, 4]);
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(7);
  const [gameState, setGameState] = useState<'playing' | 'cracked' | 'locked'>('playing');
  const [score, setScore] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Clues
  const [revealedClues, setRevealedClues] = useState<string[]>([]);

  // Sound generator
  const playTone = useCallback((type: 'click' | 'win' | 'lock') => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1046.5, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'lock') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted
    }
  }, [soundOn]);

  // Generate secret code
  const initializeVault = useCallback(() => {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    const code = pool.slice(0, 4);
    setSecretCode(code);
    setCurrentGuess([1, 2, 3, 4]);
    setHistory([]);
    setAttemptsLeft(7);
    setGameState('playing');

    // Clues based on the code
    const sum = code.reduce((a, b) => a + b, 0);
    const parity = sum % 2 === 0 ? 'EVEN' : 'ODD';
    const firstGreater = code[0] > code[3] ? 'First digit > Last digit' : 'First digit < Last digit';

    setRevealedClues([
      `Sum of all 4 digits is ${sum}.`,
      `The parity of the sum is ${parity}.`,
      `${firstGreater}.`,
    ]);
  }, []);

  useEffect(() => {
    initializeVault();
  }, [initializeVault]);

  const cycleDigit = (index: number, direction: 1 | -1) => {
    playTone('click');
    setCurrentGuess((prev) => {
      const next = [...prev];
      let val = next[index] + direction;
      if (val > 9) val = 1;
      if (val < 1) val = 9;
      next[index] = val;
      return next;
    });
  };

  const handleTestCombination = () => {
    if (gameState !== 'playing') return;

    let green = 0;
    let amber = 0;

    currentGuess.forEach((digit, idx) => {
      if (digit === secretCode[idx]) {
        green++;
      } else if (secretCode.includes(digit)) {
        amber++;
      }
    });

    const newRecord: GuessRecord = {
      digits: [...currentGuess],
      greenPins: green,
      amberPins: amber,
    };

    setHistory((prev) => [newRecord, ...prev]);

    if (green === 4) {
      // Code cracked!
      playTone('win');
      setGameState('cracked');
      const pts = attemptsLeft * 150 + 400;
      setScore(pts);

      if (user?.id) {
        gameService.saveGameScore({
          studentId: user.id,
          gameId: 'codebreaker',
          gameTitle: 'Codebreaker: The Master Vault',
          score: pts,
          accuracy: Math.round((attemptsLeft / 7) * 100),
          timeSpent: 90,
          xpEarned: 190,
          metadata: { secret: secretCode.join('') },
        }).catch(console.error);
      }
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        playTone('lock');
        setGameState('locked');
      }
    }
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
            Exit Safe
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                Codebreaker: Master Vault
              </span>
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                Security Clearance Level 4
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Mechanical Tumbler Logic & Combinatorial Deduction</p>
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

          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Lockout Tries</span>
            <span className={`text-sm font-black ${attemptsLeft <= 2 ? 'text-rose-500' : 'text-amber-500'}`}>
              {attemptsLeft} attempts left
            </span>
          </div>
        </div>
      </div>

      {/* Main Safe Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Heavy Mechanical Safe Tumblers */}
        <div className="lg:col-span-7 bg-gradient-to-b from-gray-950 via-slate-900 to-black rounded-3xl p-6 sm:p-8 border border-cyan-950/60 shadow-2xl flex flex-col justify-between text-white min-h-[460px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Rotary Tumbler Bank</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span className="text-gray-400">Green = Right Spot</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] ml-2" />
                <span className="text-gray-400">Amber = Wrong Spot</span>
              </div>
            </div>

            {/* 4 Rotary Tumbler Dials */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 my-6">
              {currentGuess.map((digit, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => cycleDigit(idx, 1)}
                    disabled={gameState !== 'playing'}
                    className="p-2 text-gray-400 hover:text-cyan-400 active:scale-95 transition"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>

                  <div className="w-full aspect-square rounded-2xl bg-gray-900/90 border-2 border-cyan-500/40 shadow-inner flex items-center justify-center font-black text-3xl sm:text-4xl text-cyan-300">
                    {digit}
                  </div>

                  <button
                    type="button"
                    onClick={() => cycleDigit(idx, -1)}
                    disabled={gameState !== 'playing'}
                    className="p-2 text-gray-400 hover:text-cyan-400 active:scale-95 transition"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={handleTestCombination}
              disabled={gameState !== 'playing'}
              leftIcon={<KeyRound className="w-5 h-5" />}
              className="w-full font-bold shadow-lg shadow-primary/30 py-4"
            >
              Test Vault Combination
            </Button>
          </div>

          {/* Deductive Crypt Clues */}
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Deductive Intelligence Wiretap:
            </span>
            <ul className="space-y-1 text-xs text-gray-300">
              {revealedClues.map((clue, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-cyan-400">❖</span>
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Attempt Feedback Ledger */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3">
              Tumbler Pin Feedback Log:
            </h4>

            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs">
                No combinations tested yet. Dial digits and test to receive green/amber pins.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {history.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 font-mono font-black text-base text-gray-900 dark:text-white">
                      {rec.digits.map((d, di) => (
                        <span key={di} className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {rec.greenPins}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {rec.amberPins}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>Passcode composed of 4 unique non-repeating digits (1-9)</span>
          </div>
        </div>
      </div>

      {/* Cracked Victory Modal */}
      <AnimatePresence>
        {gameState === 'cracked' && (
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
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Vault Cracked!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Secret passcode was [{secretCode.join(' - ')}]. You cracked the tumblers with {attemptsLeft} tries to spare!
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +190 XP Earned • Final Score: {score}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={initializeVault} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Crack Next Safe
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked Game Over Modal */}
      <AnimatePresence>
        {gameState === 'locked' && (
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
                  Lockout Alarm Triggered!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Security system engaged lockout mode. Secret code was [{secretCode.join(' - ')}].
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={initializeVault} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Retry Safe
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
