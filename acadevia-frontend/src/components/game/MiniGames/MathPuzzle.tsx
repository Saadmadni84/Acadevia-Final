import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Delete, Trophy, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface MathProblem {
  id: number;
  a: number;
  b: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  level: number;
}

/* ---------- generate problem ---------- */
const generateProblem = (level: number, id: number): MathProblem => {
  const operators: MathProblem['operator'][] = ['+', '-', '×', '÷'];
  const maxOperatorIndex = Math.min(level, operators.length) - 1;
  const operator = operators[Math.floor(Math.random() * (maxOperatorIndex + 1))];
  const range = Math.min(10 + level * 5, 100);

  let a: number, b: number, answer: number;

  switch (operator) {
    case '+':
      a = Math.floor(Math.random() * range) + 1;
      b = Math.floor(Math.random() * range) + 1;
      answer = a + b;
      break;
    case '-':
      b = Math.floor(Math.random() * range) + 1;
      a = b + Math.floor(Math.random() * range) + 1;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * Math.min(range, 12)) + 1;
      b = Math.floor(Math.random() * Math.min(range, 12)) + 1;
      answer = a * b;
      break;
    case '÷':
      b = Math.floor(Math.random() * 11) + 2;
      answer = Math.floor(Math.random() * Math.min(range, 12)) + 1;
      a = b * answer;
      break;
    default:
      a = 1;
      b = 1;
      answer = 2;
  }

  return { id, a, b, operator, answer, level };
};

/* ---------- number pad key ---------- */
const PadKey: React.FC<{
  label: string;
  onClick: () => void;
  variant?: 'default' | 'action' | 'danger';
  disabled?: boolean;
}> = ({ label, onClick, variant = 'default', disabled }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-14 rounded-xl font-bold text-lg flex items-center justify-center transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      variant === 'default' && 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
      variant === 'action' && 'bg-primary text-white hover:bg-primary-dark',
      variant === 'danger' && 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50',
      disabled && 'opacity-50 cursor-default',
    )}
    aria-label={label}
  >
    {label === 'DEL' ? <Delete className="h-5 w-5" /> : label}
  </motion.button>
);

/* ---------- main component ---------- */
const MathPuzzle: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState<MathProblem>(() => generateProblem(1, 1));
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [solvedInLevel, setSolvedInLevel] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxProblems = 15;

  /* timer */
  useEffect(() => {
    if (isPaused || problemCount >= maxProblems) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, problemCount]);

  /* keyboard input */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isPaused || feedback) return;
      if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
      if (e.key === 'Backspace') backspace();
      if (e.key === 'Enter') submitAnswer();
      if (e.key === '-' && input === '') setInput('-');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, feedback, input]);

  const appendDigit = useCallback(
    (digit: string) => {
      if (isPaused || feedback) return;
      setInput((prev) => {
        if (prev.length >= 6) return prev;
        return prev + digit;
      });
    },
    [isPaused, feedback],
  );

  const backspace = useCallback(() => {
    if (isPaused || feedback) return;
    setInput((prev) => prev.slice(0, -1));
  }, [isPaused, feedback]);

  const toggleNegative = useCallback(() => {
    if (isPaused || feedback) return;
    setInput((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  }, [isPaused, feedback]);

  const submitAnswer = useCallback(() => {
    if (isPaused || feedback || input === '' || input === '-') return;
    const userAnswer = parseInt(input, 10);
    const isCorrect = userAnswer === problem.answer;

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      const points = 100 * level;
      const newScore = score + points;
      setScore(newScore);
      onScoreChange(newScore);

      const newSolved = solvedInLevel + 1;
      setSolvedInLevel(newSolved);
      if (newSolved >= 3) {
        setLevel((l) => l + 1);
        setSolvedInLevel(0);
      }
    }

    const nextCount = problemCount + 1;
    setProblemCount(nextCount);

    setTimeout(() => {
      if (nextCount >= maxProblems) {
        onComplete(score + (isCorrect ? 100 * level : 0));
        return;
      }
      setProblem(generateProblem(isCorrect ? level + (solvedInLevel + 1 >= 3 ? 1 : 0) : level, nextCount + 1));
      setInput('');
      setFeedback(null);
    }, 800);
  }, [isPaused, feedback, input, problem, score, level, solvedInLevel, problemCount, onScoreChange, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6">
      {/* stats */}
      <div className="flex items-center justify-between w-full max-w-xs mb-6 text-sm">
        <span className="flex items-center gap-1 text-gray-500">
          <Trophy className="h-4 w-4" />
          {t('game.level', 'Level')} {level}
        </span>
        <span className="flex items-center gap-1 text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="tabular-nums">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
        </span>
        <span className="text-gray-500">{problemCount}/{maxProblems}</span>
      </div>

      {/* equation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={problem.id}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className={cn(
            'text-center mb-8 p-6 rounded-2xl border-2 w-full max-w-xs transition-colors',
            feedback === 'correct' && 'border-green-400 bg-green-50 dark:bg-green-900/20',
            feedback === 'incorrect' && 'border-red-400 bg-red-50 dark:bg-red-900/20',
            !feedback && 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
          )}
        >
          <p className="text-4xl sm:text-5xl font-bold tabular-nums">
            {problem.a} {problem.operator} {problem.b}
          </p>
          <p className="text-3xl font-bold mt-4 text-primary tabular-nums">
            = {input || <span className="text-gray-300">?</span>}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-0.5 h-8 bg-primary ml-1 align-middle" />
          </p>

          {feedback === 'incorrect' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-2">
              {t('game.correctAnswer', 'Answer')}: {problem.answer}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* number pad */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
          <PadKey key={key} label={key} onClick={() => appendDigit(key)} disabled={isPaused || !!feedback} />
        ))}
        <PadKey label="±" onClick={toggleNegative} variant="danger" disabled={isPaused || !!feedback} />
        <PadKey label="0" onClick={() => appendDigit('0')} disabled={isPaused || !!feedback} />
        <PadKey label="DEL" onClick={backspace} variant="danger" disabled={isPaused || !!feedback} />
        <div className="col-span-3 mt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={submitAnswer}
            disabled={isPaused || !!feedback || input === '' || input === '-'}
            className={cn(
              'w-full h-14 rounded-xl font-bold text-lg bg-primary text-white hover:bg-primary-dark transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-default flex items-center justify-center gap-2',
            )}
            aria-label={t('game.submit', 'Submit answer')}
          >
            {t('game.submit', 'Submit')} <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MathPuzzle;
