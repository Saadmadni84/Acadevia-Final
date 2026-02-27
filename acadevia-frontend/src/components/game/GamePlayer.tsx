import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Pause,
  Play,
  RotateCcw,
  LogOut,
  Maximize,
  Minimize,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Game } from '@/types/game.types';

/* ---------- lazy-loaded mini-games ---------- */
const miniGameComponents: Record<string, React.LazyExoticComponent<React.FC<MiniGameProps>>> = {
  matchThePairs: lazy(() => import('./MiniGames/MatchThePairs')),
  wordScramble: lazy(() => import('./MiniGames/WordScramble')),
  quizRace: lazy(() => import('./MiniGames/QuizRace')),
  fillInBlanks: lazy(() => import('./MiniGames/FillInBlanks')),
  trueFalse: lazy(() => import('./MiniGames/TrueFalse')),
  mathPuzzle: lazy(() => import('./MiniGames/MathPuzzle')),
  spinTheWheel: lazy(() => import('./MiniGames/SpinTheWheel')),
  flashCards: lazy(() => import('./MiniGames/FlashCards')),
};

/* ---------- types ---------- */
export interface MiniGameProps {
  isPaused: boolean;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onComplete: (finalScore: number) => void;
}

interface GamePlayerProps {
  game: Game;
  onComplete: (score: number) => void;
  onQuit: () => void;
}

/* ---------- animated score counter ---------- */
const AnimatedScore: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = display;
    const diff = value - start;
    const duration = 400;
    const t0 = performance.now();
    const tick = (now: number) => {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(start + diff * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

/* ---------- lives display ---------- */
const LivesDisplay: React.FC<{ lives: number; maxLives?: number }> = ({ lives, maxLives = 3 }) => (
  <div className="flex items-center gap-1" role="status" aria-label={`${lives} lives remaining`}>
    {Array.from({ length: maxLives }).map((_, i) => (
      <motion.div
        key={i}
        animate={i < lives ? { scale: [1, 1.3, 1] } : { scale: 1, opacity: 0.25 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn('h-5 w-5', i < lives ? 'fill-red-500 text-red-500' : 'text-gray-400')}
        />
      </motion.div>
    ))}
  </div>
);

/* ---------- timer ---------- */
const Timer: React.FC<{ seconds: number }> = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className={cn('tabular-nums font-mono text-lg font-semibold', seconds <= 10 && 'text-red-500 animate-pulse')}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
};

/* ---------- main component ---------- */
const GamePlayer: React.FC<GamePlayerProps> = ({ game, onComplete, onQuit }) => {
  const { t } = useTranslation();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(game.duration ?? 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* timer logic */
  useEffect(() => {
    if (!game.duration || game.duration <= 0) return;
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, game.duration, onComplete, score]);

  /* fullscreen */
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      /* fullscreen not supported */
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPaused) setShowExitConfirm(true);
        else setIsPaused(true);
      }
      if (e.key === 'p' || e.key === 'P') setIsPaused((p) => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPaused]);

  const handleComplete = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      onComplete(finalScore);
    },
    [onComplete],
  );

  const GameComponent = miniGameComponents[game.type];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col"
      role="main"
      aria-label={t('game.player', 'Game Player')}
    >
      {/* HUD */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {/* left: lives */}
        <LivesDisplay lives={lives} />

        {/* center: timer (optional) */}
        {game.duration && game.duration > 0 && <Timer seconds={timeLeft} />}

        {/* right: score + controls */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('game.score', 'Score')}</p>
            <p className="text-lg font-bold text-primary tabular-nums">
              <AnimatedScore value={score} />
            </p>
          </div>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label={isPaused ? t('game.resume', 'Resume') : t('game.pause', 'Pause')}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors hidden sm:block"
            aria-label={t('game.fullscreen', 'Toggle fullscreen')}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* game area */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
          }
        >
          {GameComponent ? (
            <GameComponent
              isPaused={isPaused}
              onScoreChange={setScore}
              onLivesChange={setLives}
              onComplete={handleComplete}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <AlertTriangle className="h-10 w-10" />
              <p>{t('game.unknownType', 'Unknown game type')}</p>
            </div>
          )}
        </Suspense>

        {/* pause overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
              role="dialog"
              aria-label={t('game.pauseMenu', 'Pause Menu')}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-72 shadow-2xl space-y-4 text-center"
              >
                <h2 className="text-xl font-bold">{t('game.paused', 'Paused')}</h2>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    leftIcon={<Play className="h-4 w-4" />}
                    onClick={() => setIsPaused(false)}
                  >
                    {t('game.resume', 'Resume')}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    onClick={() => {
                      setScore(0);
                      setLives(3);
                      setTimeLeft(game.duration ?? 0);
                      setIsPaused(false);
                    }}
                  >
                    {t('game.restart', 'Restart')}
                  </Button>

                  <Button
                    variant="danger"
                    size="lg"
                    className="w-full"
                    leftIcon={<LogOut className="h-4 w-4" />}
                    onClick={() => setShowExitConfirm(true)}
                  >
                    {t('game.quit', 'Quit')}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* exit confirmation */}
      <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} title={t('game.exitTitle', 'Quit Game?')} size="sm">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('game.exitMessage', 'Your progress will be lost. Are you sure you want to quit?')}
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowExitConfirm(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            leftIcon={<X className="h-4 w-4" />}
            onClick={() => {
              setShowExitConfirm(false);
              onQuit();
            }}
          >
            {t('game.quit', 'Quit')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GamePlayer;
export { GamePlayer };
