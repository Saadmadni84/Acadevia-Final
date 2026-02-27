import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Trophy,
  Clock,
  Zap,
  Share2,
  RotateCcw,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/* ---------- types ---------- */
interface GameResultsProps {
  score: number;
  xpEarned: number;
  timePlayed: number; // seconds
  starsEarned: 1 | 2 | 3;
  leaderboardPosition: number;
  isHighScore?: boolean;
  onPlayAgain: () => void;
  onNextGame: () => void;
  onShare?: () => void;
  className?: string;
}

/* ---------- animated count-up ---------- */
const useCountUp = (target: number, duration = 1200, delay = 0): number => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let raf: number;
      const t0 = performance.now();
      const tick = (now: number) => {
        const elapsed = now - t0;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setValue(Math.round(target * eased));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
};

/* ---------- confetti particle ---------- */
const ConfettiParticle: React.FC<{ index: number }> = ({ index }) => {
  const colors = ['#D4A843', '#E74C3C', '#7B3F95', '#5B2C6F', '#B08B2E', '#F39C12', '#B98FD1', '#4A2359'];
  const color = colors[index % colors.length];
  const x = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const rotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%`, top: -10 }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ y: '100vh', opacity: 0, rotate: rotation }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
    />
  );
};

/* ---------- star display ---------- */
const StarsDisplay: React.FC<{ count: 1 | 2 | 3 }> = ({ count }) => (
  <div className="flex items-center gap-2" role="img" aria-label={`${count} stars earned`}>
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, rotate: -180 }}
        animate={i <= count ? { scale: 1, rotate: 0 } : { scale: 0.6, rotate: 0 }}
        transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 200 }}
      >
        <Star
          className={cn(
            'h-10 w-10 sm:h-14 sm:w-14 transition-colors',
            i <= count ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' : 'text-gray-300 dark:text-gray-600',
          )}
        />
      </motion.div>
    ))}
  </div>
);

/* ---------- stat item ---------- */
const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; delay?: number }> = ({
  icon,
  label,
  value,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex flex-col items-center gap-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
  >
    <div className="text-primary">{icon}</div>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-lg font-bold tabular-nums">{value}</p>
  </motion.div>
);

/* ---------- format time ---------- */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/* ---------- main component ---------- */
const GameResults: React.FC<GameResultsProps> = ({
  score,
  xpEarned,
  timePlayed,
  starsEarned,
  leaderboardPosition,
  isHighScore = false,
  onPlayAgain,
  onNextGame,
  onShare,
  className,
}) => {
  const { t } = useTranslation();
  const animatedScore = useCountUp(score, 1500, 600);
  const animatedXP = useCountUp(xpEarned, 1000, 1000);

  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare();
      return;
    }
    try {
      await navigator.share?.({
        title: t('game.shareTitle', 'My Game Score!'),
        text: t('game.shareText', `I scored ${score} points and earned ${starsEarned} stars!`),
      });
    } catch {
      /* share cancelled or not supported */
    }
  }, [onShare, score, starsEarned, t]);

  return (
    <div className={cn('relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden', className)}>
      {/* confetti */}
      {isHighScore && (
        <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* header */}
        {isHighScore && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-yellow-500"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              {t('game.newHighScore', 'New High Score!')}
            </span>
            <Sparkles className="h-5 w-5" />
          </motion.div>
        )}

        {/* stars */}
        <StarsDisplay count={starsEarned} />

        {/* score */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('game.finalScore', 'Final Score')}
          </p>
          <p className="text-5xl sm:text-6xl font-extrabold text-primary tabular-nums mt-1">
            {animatedScore.toLocaleString()}
          </p>
        </motion.div>

        {/* stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatItem
            icon={<Zap className="h-5 w-5" />}
            label={t('game.xpEarned', 'XP Earned')}
            value={`+${animatedXP}`}
            delay={0.8}
          />
          <StatItem
            icon={<Clock className="h-5 w-5" />}
            label={t('game.timePlayed', 'Time')}
            value={formatTime(timePlayed)}
            delay={1.0}
          />
          <StatItem
            icon={<Trophy className="h-5 w-5" />}
            label={t('game.rank', 'Rank')}
            value={`#${leaderboardPosition}`}
            delay={1.2}
          />
        </div>

        {/* actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-3 pt-4"
        >
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={onPlayAgain}
          >
            {t('game.playAgain', 'Play Again')}
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={onNextGame}
          >
            {t('game.nextGame', 'Next Game')}
          </Button>
        </motion.div>

        {/* share */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Share2 className="h-4 w-4" />}
            onClick={handleShare}
          >
            {t('game.shareScore', 'Share Score')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameResults;
export { GameResults };
