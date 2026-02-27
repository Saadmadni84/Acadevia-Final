import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const QuizTimer: React.FC<QuizTimerProps> = ({ totalSeconds, onTimeUp, isPaused = false }) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (isPaused) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPaused]);

  const fraction = remaining / totalSeconds;
  const offset = CIRCUMFERENCE * (1 - fraction);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getColor = useCallback((): string => {
    if (fraction > 0.5) return '#22c55e'; // green-500
    if (fraction > 0.25) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  }, [fraction]);

  const isWarning = remaining <= 30 && remaining > 0;
  const isCritical = fraction <= 0.25 && remaining > 0;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={isCritical ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } : {}}
      role="timer"
      aria-live="polite"
      aria-label={`${minutes} minutes ${seconds} seconds remaining`}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          initial={false}
          animate={{ strokeDashoffset: offset, stroke: getColor() }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </svg>

      {/* Center text */}
      <motion.span
        className={cn(
          'absolute text-lg font-mono font-bold',
          fraction > 0.5
            ? 'text-green-600 dark:text-green-400'
            : fraction > 0.25
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400',
        )}
        animate={isWarning ? { opacity: [1, 0.5, 1] } : {}}
        transition={isWarning ? { repeat: Infinity, duration: 1 } : {}}
      >
        {display}
      </motion.span>
    </motion.div>
  );
};

export default QuizTimer;
