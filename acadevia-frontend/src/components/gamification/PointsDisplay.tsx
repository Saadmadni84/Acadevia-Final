import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Coins, Sparkles, ChevronDown } from 'lucide-react';

interface XPHistoryEntry {
  label: string;
  xp: number;
  date: string;
}

interface PointsDisplayProps {
  points: number;
  history?: XPHistoryEntry[];
  className?: string;
}

const formatCompact = (n: number): string => {
  if (n >= 10_000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
};

const useCountUp = (target: number, duration = 800): number => {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    if (from === target) return;
    prevRef.current = target;

    const start = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
};

const PointsDisplay: React.FC<PointsDisplayProps> = ({ points, history = [], className }) => {
  const { t } = useTranslation();
  const displayed = useCountUp(points);
  const [showHistory, setShowHistory] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const prevPoints = useRef(points);

  useEffect(() => {
    if (points > prevPoints.current) {
      setShowSparkle(true);
      const timer = setTimeout(() => setShowSparkle(false), 1200);
      prevPoints.current = points;
      return () => clearTimeout(timer);
    }
    prevPoints.current = points;
  }, [points]);

  const toggleHistory = useCallback(() => setShowHistory((v) => !v), []);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={toggleHistory}
        aria-expanded={showHistory}
        aria-label={t('gamification.pointsHistory', 'View XP history')}
        className={cn(
          'glass-card px-4 py-3 flex items-center gap-3 w-full',
          'cursor-pointer hover:shadow-lg transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
      >
        {/* Coin Icon */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={showSparkle ? { rotate: [0, -10, 10, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Coins className="h-7 w-7 text-yellow-500" />
          </motion.div>

          {/* Sparkle effect */}
          <AnimatePresence>
            {showSparkle && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="h-5 w-5 text-yellow-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animated number */}
        <div className="flex-1 text-left">
          <motion.p
            key={displayed}
            className="text-xl font-bold tabular-nums"
            aria-live="polite"
          >
            {formatCompact(displayed)}
          </motion.p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            {t('gamification.xpPoints', 'XP Points')}
          </p>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            showHistory && 'rotate-180'
          )}
        />
      </button>

      {/* History dropdown */}
      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card mt-1 overflow-hidden absolute left-0 right-0 z-20 shadow-xl"
          >
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 max-h-48 overflow-y-auto">
              {history.map((entry, i) => (
                <li key={`${entry.date}-${i}`} className="flex items-center justify-between px-4 py-2 text-sm">
                  <div>
                    <p className="font-medium truncate">{entry.label}</p>
                    <p className="text-[10px] text-gray-400">{entry.date}</p>
                  </div>
                  <span className="text-secondary font-semibold flex-shrink-0">+{entry.xp}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { PointsDisplay };
