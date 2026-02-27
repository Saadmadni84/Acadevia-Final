import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Timer, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

interface Competitor {
  name: string;
  score: number;
  avatar: string;
}

/* ---------- mock data ---------- */
const MOCK_QUESTIONS: Question[] = [
  { id: 1, text: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Madrid'], correctIndex: 1 },
  { id: 2, text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctIndex: 2 },
  { id: 3, text: 'What is 12 × 12?', options: ['124', '144', '132', '156'], correctIndex: 1 },
  { id: 4, text: 'Who painted the Mona Lisa?', options: ['Picasso', 'Van Gogh', 'Da Vinci', 'Monet'], correctIndex: 2 },
  { id: 5, text: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3 },
  { id: 6, text: 'H₂O is the formula for?', options: ['Hydrogen', 'Water', 'Oxygen', 'Salt'], correctIndex: 1 },
  { id: 7, text: 'How many continents are there?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { id: 8, text: "What is the speed of light?", options: ['300 km/s', '300,000 km/s', '3,000 km/s', '30,000 km/s'], correctIndex: 1 },
];

const MOCK_COMPETITORS: Competitor[] = [
  { name: 'Alex', score: 0, avatar: '🧑' },
  { name: 'Sam', score: 0, avatar: '👩' },
  { name: 'Jordan', score: 0, avatar: '🧔' },
];

/* ---------- main component ---------- */
const QuizRace: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [competitors, setCompetitors] = useState(MOCK_COMPETITORS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = MOCK_QUESTIONS[currentIndex];
  const totalQuestions = MOCK_QUESTIONS.length;
  const isComplete = currentIndex >= totalQuestions;

  /* timer */
  useEffect(() => {
    if (isPaused || showResult || isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current!);
          handleAnswer(-1); // time out
          return 0;
        }
        return Math.max(prev - 0.1, 0);
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, showResult, currentIndex, isComplete]);

  /* mock competitors progress */
  useEffect(() => {
    if (showResult) {
      setCompetitors((prev) =>
        prev.map((c) => ({
          ...c,
          score: c.score + (Math.random() > 0.4 ? Math.floor(50 + Math.random() * 100) : 0),
        })),
      );
    }
  }, [showResult]);

  /* handle answer */
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (selectedOption !== null || isPaused) return;
      setSelectedOption(optionIndex);
      setShowResult(true);

      const isCorrect = optionIndex === question.correctIndex;
      if (isCorrect) {
        const speedBonus = Math.round(timeLeft * 10);
        const streakBonus = streak >= 2 ? streak * 20 : 0;
        const pointsEarned = (100 + speedBonus + streakBonus) * multiplier;
        const newScore = score + pointsEarned;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);
        setMultiplier(newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1);
        onScoreChange(newScore);
      } else {
        setStreak(0);
        setMultiplier(1);
      }

      // Auto-advance
      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= totalQuestions) {
          onComplete(score + (isCorrect ? Math.round(timeLeft * 10) + 100 : 0));
        } else {
          setCurrentIndex(nextIndex);
          setSelectedOption(null);
          setShowResult(false);
          setTimeLeft(timePerQuestion);
        }
      }, 1500);
    },
    [selectedOption, isPaused, question, timeLeft, streak, multiplier, score, currentIndex, totalQuestions, onScoreChange, onComplete, timePerQuestion],
  );

  if (isComplete) return null;

  const timerPercent = (timeLeft / timePerQuestion) * 100;
  const timerColor = timerPercent > 50 ? 'bg-green-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col h-full p-4 sm:p-6">
      {/* top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* streak */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-1 rounded-full text-xs font-bold"
            >
              <Zap className="h-3 w-3" />
              {streak} {t('game.streak', 'Streak')}
            </motion.div>
          )}
          {/* multiplier */}
          {multiplier > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-1 rounded-full text-xs font-bold"
            >
              <TrendingUp className="h-3 w-3" />
              {multiplier}x
            </motion.div>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* timer bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
        <motion.div
          className={cn('h-full rounded-full transition-colors', timerColor)}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full"
        >
          <h3 className="text-lg sm:text-xl font-bold text-center mb-8">{question.text}</h3>

          {/* options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option, i) => {
              const isCorrect = i === question.correctIndex;
              const isSelected = i === selectedOption;
              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedOption !== null || isPaused}
                  whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                  animate={
                    showResult
                      ? isCorrect
                        ? { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgb(34, 197, 94)' }
                        : isSelected && !isCorrect
                          ? { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgb(239, 68, 68)', x: [0, -5, 5, -5, 0] }
                          : {}
                      : {}
                  }
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    selectedOption === null
                      ? 'border-gray-200 dark:border-gray-700 hover:border-primary bg-white dark:bg-gray-900'
                      : 'cursor-default',
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                  </span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* progress bar */}
      <div className="mt-6">
        <Progress value={currentIndex + 1} max={totalQuestions} size="sm" />
      </div>

      {/* competitor strip */}
      <div className="mt-4 flex items-center gap-4 justify-center">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Users className="h-3 w-3" />
          {t('game.competitors', 'Competitors')}:
        </span>
        {competitors.map((c) => (
          <div key={c.name} className="flex items-center gap-1 text-xs">
            <span>{c.avatar}</span>
            <span className="font-medium">{c.name}</span>
            <span className="text-gray-400 tabular-nums">{c.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizRace;
