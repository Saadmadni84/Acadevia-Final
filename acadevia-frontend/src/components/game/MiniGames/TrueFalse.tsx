import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, X, Clock, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface Statement {
  id: number;
  text: string;
  isTrue: boolean;
}

/* ---------- sample statements ---------- */
const SAMPLE_STATEMENTS: Statement[] = [
  { id: 1, text: 'The Earth is the third planet from the Sun.', isTrue: true },
  { id: 2, text: 'Sound travels faster than light.', isTrue: false },
  { id: 3, text: "A group of lions is called a pride.", isTrue: true },
  { id: 4, text: 'The Great Wall of China is visible from space.', isTrue: false },
  { id: 5, text: 'Water freezes at 0°C at sea level.', isTrue: true },
  { id: 6, text: 'Diamonds are made of carbon.', isTrue: true },
  { id: 7, text: 'The Amazon is the longest river in the world.', isTrue: false },
  { id: 8, text: 'Octopuses have three hearts.', isTrue: true },
  { id: 9, text: 'Lightning never strikes the same place twice.', isTrue: false },
  { id: 10, text: 'Honey never spoils.', isTrue: true },
];

/* ---------- main component ---------- */
const TrueFalse: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [answered, setAnswered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const trueOpacity = useTransform(x, [0, 100], [0, 1]);
  const falseOpacity = useTransform(x, [-100, 0], [1, 0]);

  const statement = SAMPLE_STATEMENTS[currentIndex];
  const totalStatements = SAMPLE_STATEMENTS.length;
  const isComplete = currentIndex >= totalStatements;

  /* timer */
  useEffect(() => {
    if (isPaused || answered || isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null); // timed out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, answered, currentIndex, isComplete]);

  /* handle answer */
  const handleAnswer = useCallback(
    (userAnswer: boolean | null) => {
      if (answered || isPaused) return;
      setAnswered(true);

      const isCorrect = userAnswer === statement.isTrue;
      setFlash(isCorrect ? 'green' : 'red');

      if (isCorrect) {
        const timeBonus = timeLeft * 5;
        const streakBonus = streak >= 2 ? streak * 15 : 0;
        const newScore = score + 100 + timeBonus + streakBonus;
        setScore(newScore);
        setStreak((s) => s + 1);
        onScoreChange(newScore);
      } else {
        setStreak(0);
      }

      setTimeout(() => {
        setFlash(null);
        setAnswered(false);
        setTimeLeft(10);
        x.set(0);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= totalStatements) {
          onComplete(score + (isCorrect ? 100 + timeLeft * 5 : 0));
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 800);
    },
    [answered, isPaused, statement, timeLeft, streak, score, currentIndex, totalStatements, onScoreChange, onComplete, x],
  );

  /* swipe handler */
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 100) {
        handleAnswer(info.offset.x > 0); // right = true, left = false
      } else {
        x.set(0);
      }
    },
    [handleAnswer, x],
  );

  if (isComplete) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 relative overflow-hidden">
      {/* flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
              'absolute inset-0 z-40 pointer-events-none',
              flash === 'green' ? 'bg-green-500' : 'bg-red-500',
            )}
          />
        )}
      </AnimatePresence>

      {/* top bar */}
      <div className="flex items-center justify-between w-full max-w-sm mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{currentIndex + 1}/{totalStatements}</span>
          {streak > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full"
            >
              <Zap className="h-3 w-3" />
              {streak}
            </motion.span>
          )}
        </div>
        <span className={cn('flex items-center gap-1 font-mono font-bold tabular-nums text-sm', timeLeft <= 3 && 'text-red-500 animate-pulse')}>
          <Clock className="h-4 w-4" />
          {timeLeft}s
        </span>
      </div>

      {/* score */}
      <p className="text-2xl font-bold text-primary mb-8 tabular-nums">{score.toLocaleString()}</p>

      {/* swipe hints */}
      <div className="flex items-center justify-between w-full max-w-sm mb-4 px-4">
        <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
          <ArrowLeft className="h-4 w-4" /> {t('game.false', 'False')}
        </span>
        <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
          {t('game.true', 'True')} <ArrowRight className="h-4 w-4" />
        </span>
      </div>

      {/* swipeable card */}
      <div className="relative w-full max-w-sm h-48 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={statement.id}
            drag={!isPaused && !answered ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            style={{ x, rotate }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing select-none"
            role="article"
            aria-label={statement.text}
          >
            {/* true indicator */}
            <motion.div
              style={{ opacity: trueOpacity }}
              className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold"
            >
              {t('game.true', 'TRUE')}
            </motion.div>
            {/* false indicator */}
            <motion.div
              style={{ opacity: falseOpacity }}
              className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
            >
              {t('game.false', 'FALSE')}
            </motion.div>

            <p className="text-center text-lg font-medium">{statement.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* tap buttons */}
      <div className="flex items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAnswer(false)}
          disabled={isPaused || answered}
          className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 transition-colors"
          aria-label={t('game.false', 'False')}
        >
          <X className="h-8 w-8" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAnswer(true)}
          disabled={isPaused || answered}
          className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 transition-colors"
          aria-label={t('game.true', 'True')}
        >
          <Check className="h-8 w-8" />
        </motion.button>
      </div>
    </div>
  );
};

export default TrueFalse;
