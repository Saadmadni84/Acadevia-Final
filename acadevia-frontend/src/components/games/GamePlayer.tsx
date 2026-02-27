import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Clock, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface GamePlayerProps {
  gameId: string;
}

type GameState = 'loading' | 'ready' | 'playing' | 'finished';

const GamePlayer: React.FC<GamePlayerProps> = ({ gameId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('loading');
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Simulate game loading
    const timer = setTimeout(() => setGameState('ready'), 800);
    return () => clearTimeout(timer);
  }, [gameId]);

  useEffect(() => {
    return () => {
      if (timerRef) clearInterval(timerRef);
    };
  }, [timerRef]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeElapsed(0);
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    setTimerRef(interval);
  }, []);

  const endGame = useCallback(() => {
    if (timerRef) clearInterval(timerRef);
    setTimerRef(null);
    setGameState('finished');
    // Mock score
    setScore(Math.floor(Math.random() * 80) + 20);
  }, [timerRef]);

  const restart = useCallback(() => {
    setGameState('ready');
    setScore(0);
    setTimeElapsed(0);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (gameState === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (gameState === 'ready') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
      >
        <div className="text-6xl mb-6">🎮</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('games.play.ready', 'Ready to Play?')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
          {t('games.play.readyDesc', 'Test your knowledge and earn XP. Good luck!')}
        </p>
        <Button variant="gradient" size="lg" onClick={startGame} leftIcon={<Play className="h-5 w-5" />}>
          {t('games.play.start', 'Start Game')}
        </Button>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
      >
        <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {t('games.play.completed', 'Game Complete!')}
        </h2>
        <div className="flex items-center gap-6 mt-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{score}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{t('games.play.score', 'Score')}</p>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">+{Math.round(score * 0.3)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">XP</p>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{formatTime(timeElapsed)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{t('games.play.time', 'Time')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            {t('games.play.back', 'Back to Games')}
          </Button>
          <Button variant="gradient" onClick={restart} leftIcon={<RotateCcw className="h-4 w-4" />}>
            {t('games.play.playAgain', 'Play Again')}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Playing state
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Game HUD */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatTime(timeElapsed)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Star className="h-4 w-4" />
          <span>{score} pts</span>
        </div>
      </div>

      {/* Game area placeholder */}
      <div className="flex flex-col items-center justify-center h-80 p-8">
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t('games.play.inProgress', 'Game in progress...')}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          Game ID: {gameId}
        </p>
        <Button variant="primary" onClick={endGame}>
          {t('games.play.finish', 'Finish Game')}
        </Button>
      </div>
    </div>
  );
};

export { GamePlayer };
