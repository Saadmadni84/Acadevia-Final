import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Workflow,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface SequencePuzzle {
  id: number;
  category: string;
  chain: string[];
  missingIndex: number;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const PUZZLES: SequencePuzzle[] = [
  {
    id: 1,
    category: 'Arithmetic Progression',
    chain: ['3', '7', '11', '15', '?', '23'],
    missingIndex: 4,
    options: ['17', '18', '19', '21'],
    correctAnswer: '19',
    explanation: 'Common difference rule: Add +4 at each successive term (15 + 4 = 19).',
  },
  {
    id: 2,
    category: 'Geometric Doubling',
    chain: ['2', '6', '18', '?', '162', '486'],
    missingIndex: 3,
    options: ['36', '48', '54', '72'],
    correctAnswer: '54',
    explanation: 'Common ratio rule: Multiply by 3 at each term (18 × 3 = 54).',
  },
  {
    id: 3,
    category: 'Fibonacci Series',
    chain: ['1', '2', '3', '5', '8', '?', '21'],
    missingIndex: 5,
    options: ['11', '12', '13', '15'],
    correctAnswer: '13',
    explanation: 'Fibonacci recurrence: Each term is the sum of the preceding two (5 + 8 = 13).',
  },
  {
    id: 4,
    category: 'Rotational Symmetry',
    chain: ['⬆️', '↗️', '➡️', '↘️', '?', '↙️'],
    missingIndex: 4,
    options: ['⬅️', '⬇️', '↖️', '⬆️'],
    correctAnswer: '⬇️',
    explanation: 'Rotational transformation: 45° clockwise step at every transition (↘️ + 45° = ⬇️).',
  },
  {
    id: 5,
    category: 'Square Sequence',
    chain: ['1²', '2²', '3²', '4²', '?', '6²'],
    missingIndex: 4,
    options: ['20', '25', '30', '36'],
    correctAnswer: '25',
    explanation: 'Quadratic progression: 5² = 25.',
  },
  {
    id: 6,
    category: 'Dual Interleaved Pattern',
    chain: ['10', '50', '15', '45', '20', '40', '?'],
    missingIndex: 6,
    options: ['25', '30', '35', '45'],
    correctAnswer: '25',
    explanation: 'Interleaved sequences: Odd indices increase (+5): 10, 15, 20, 25. Even indices decrease (-5): 50, 45, 40.',
  },
];

export const SequenceBuilder: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);

  const currentPuzzle = PUZZLES[puzzleIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const correct = option === currentPuzzle.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 150 + streak * 25);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextPuzzle = () => {
    if (puzzleIndex + 1 < PUZZLES.length) {
      setPuzzleIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setGameComplete(true);
      if (user?.id) {
        gameService.saveGameScore({
          studentId: user.id,
          gameId: 'sequence-builder',
          gameTitle: 'Sequence Builder',
          score: score + 500,
          accuracy: Math.round((score / (PUZZLES.length * 200)) * 100),
          timeSpent: 120,
          xpEarned: 180,
          metadata: { totalPuzzles: PUZZLES.length },
        }).catch(console.error);
      }
    }
  };

  const handleRestart = () => {
    setPuzzleIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setStreak(0);
    setGameComplete(false);
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
                Sequence Builder
              </span>
              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                Pattern {puzzleIndex + 1} of {PUZZLES.length}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">{currentPuzzle.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="text-xs font-black text-amber-500 px-2 py-0.5 rounded-md bg-amber-500/10">
              {streak}x Streak 🔥
            </span>
          )}
          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
            <span className="text-lg font-black text-primary">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Main Puzzle Workbench */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-slate-900 to-black border border-indigo-950/50 p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[480px]">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Puzzle Category & Instruction Banner */}
        <div className="relative z-10 flex items-center justify-between bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white">
          <div className="flex items-center gap-2.5">
            <Workflow className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-gray-200">
              Identify the governing mathematical or logical rule and place the missing link!
            </span>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            {currentPuzzle.category}
          </Badge>
        </div>

        {/* Sequence Rail Display */}
        <div className="relative z-10 my-8 py-6 px-4 bg-gray-900/60 rounded-3xl border border-gray-800/80 shadow-inner flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {currentPuzzle.chain.map((item, idx) => {
            const isMissing = idx === currentPuzzle.missingIndex;
            const isFilled = isMissing && isAnswered;

            return (
              <React.Fragment key={idx}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl border-2 transition-all ${
                    isMissing
                      ? isFilled
                        ? isCorrect
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-[0_0_20px_#10b981]'
                          : 'bg-rose-950/60 border-rose-400 text-rose-300 shadow-[0_0_20px_#f43f5e]'
                        : 'bg-indigo-950/40 border-dashed border-indigo-400/60 text-indigo-300 animate-pulse'
                      : 'bg-gray-800/90 border-gray-700/80 text-white shadow-md'
                  }`}
                >
                  {isMissing ? (isFilled ? selectedAnswer : '?') : item}
                </motion.div>

                {/* Connecting Arrow */}
                {idx < currentPuzzle.chain.length - 1 && (
                  <div className="text-gray-600 font-mono text-sm hidden sm:block">➔</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Answer Candidate Options */}
        <div className="relative z-10 space-y-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
            Select the Missing Element:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto w-full">
            {currentPuzzle.options.map((opt) => {
              const isChosen = selectedAnswer === opt;
              const isTheCorrectOne = opt === currentPuzzle.correctAnswer;

              return (
                <motion.button
                  key={opt}
                  type="button"
                  whileHover={!isAnswered ? { scale: 1.05 } : {}}
                  whileTap={!isAnswered ? { scale: 0.95 } : {}}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`py-4 px-3 rounded-2xl border-2 font-black text-lg transition-all ${
                    isAnswered
                      ? isTheCorrectOne
                        ? 'bg-emerald-900/60 border-emerald-400 text-white shadow-[0_0_15px_#10b981]'
                        : isChosen
                        ? 'bg-rose-900/60 border-rose-400 text-white'
                        : 'bg-gray-900/40 border-gray-800 text-gray-600 opacity-50'
                      : 'bg-gray-900/80 border-gray-700 hover:border-indigo-400 text-white hover:bg-indigo-950/40'
                  }`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Explanation & Next Button */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative z-10 mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isCorrect
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className="font-bold block">
                  {isCorrect ? 'Sequence Logic Verified!' : 'Sequence Broken!'}
                </span>
                <p className="text-gray-300 mt-0.5">{currentPuzzle.explanation}</p>
              </div>
            </div>

            <Button
              variant="gradient"
              size="sm"
              onClick={handleNextPuzzle}
              className="font-bold shrink-0 px-6"
            >
              {puzzleIndex + 1 < PUZZLES.length ? 'Next Pattern ➔' : 'View Results 🏆'}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {gameComplete && (
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
                  Sequence Master!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You resolved all progressive numerical and rotational sequences.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +180 XP Earned • Final Score: {score}
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
