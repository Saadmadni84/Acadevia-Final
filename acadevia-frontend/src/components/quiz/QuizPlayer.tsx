import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points: number;
}

interface QuizPlayerProps {
  title: string;
  chapter?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  onComplete: (result: { score: number; totalPoints: number; answers: number[]; timeTaken: number }) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ title, chapter, questions, timeLimit, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!timeLimit || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { finishQuiz(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimit, showResult]);

  const finishQuiz = useCallback(() => {
    const finalAnswers = [...answers];
    while (finalAnswers.length < questions.length) finalAnswers.push(-1);
    const score = finalAnswers.reduce((s, a, i) => s + (a === questions[i].correctIndex ? questions[i].points : 0), 0);
    const totalPoints = questions.reduce((s, q) => s + q.points, 0);
    setShowResult(true);
    onComplete({ score, totalPoints, answers: finalAnswers, timeTaken: Math.floor((Date.now() - startTime) / 1000) });
  }, [answers, questions, onComplete, startTime]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected ?? -1];
    setAnswers(newAnswers);
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const score = newAnswers.reduce((s, a, i) => s + (a === questions[i].correctIndex ? questions[i].points : 0), 0);
      const totalPoints = questions.reduce((s, q) => s + q.points, 0);
      setShowResult(true);
      onComplete({ score, totalPoints, answers: newAnswers, timeTaken: Math.floor((Date.now() - startTime) / 1000) });
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 text-center space-y-3 shadow-sm">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This quiz has no questions available.
        </p>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          {chapter && (
            <p className="text-xs font-semibold text-primary dark:text-[#D4A843] mb-0.5">
              {chapter}
            </p>
          )}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {timeLimit && !showResult && (
          <div className={cn('flex items-center gap-1 text-sm font-mono px-3 py-1 rounded-full', timeLeft < 30 ? 'bg-accent/10 text-accent animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-600')}>
            <Clock className="h-4 w-4" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      <Progress value={progress} size="sm" className="mb-6" />

      {!showResult ? (
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Question {current + 1}/{questions.length}
              </span>
              <span className="text-xs text-gray-500">{q.points} pts</span>
            </div>
            <h3 className="text-base font-semibold mb-6">{q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={selected === null ? { scale: 1.01 } : {}}
                  whileTap={selected === null ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(idx)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all text-sm flex items-center gap-3',
                    selected === null ? 'border-gray-200 dark:border-gray-700 hover:border-primary cursor-pointer' :
                    idx === q.correctIndex ? 'border-secondary bg-secondary/10' :
                    idx === selected ? 'border-accent bg-accent/10' :
                    'border-gray-200 dark:border-gray-700 opacity-50'
                  )}
                >
                  <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    selected === null ? 'bg-gray-100 dark:bg-gray-800' :
                    idx === q.correctIndex ? 'bg-secondary text-white' :
                    idx === selected ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-800'
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {selected !== null && idx === q.correctIndex && <CheckCircle className="h-5 w-5 text-secondary" />}
                  {selected !== null && idx === selected && idx !== q.correctIndex && <XCircle className="h-5 w-5 text-accent" />}
                </motion.button>
              ))}
            </div>
            {selected !== null && q.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 rounded-lg bg-primary/10 dark:bg-primary/20 text-sm border border-primary/20">
                <p className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />{q.explanation}</p>
              </motion.div>
            )}
            <div className="flex justify-end mt-6">
              <Button variant="gradient" onClick={handleNext} disabled={selected === null} rightIcon={<ChevronRight className="h-4 w-4" />}>
                {current < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <QuizResults questions={questions} answers={answers} timeTaken={Math.floor((Date.now() - startTime) / 1000)} />
      )}
    </div>
  );
};

const QuizResults: React.FC<{ questions: QuizQuestion[]; answers: number[]; timeTaken: number }> = ({ questions, answers, timeTaken }) => {
  const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const score = answers.reduce((s, a, i) => s + (a === questions[i].correctIndex ? questions[i].points : 0), 0);
  const total = questions.reduce((s, q) => s + q.points, 0);
  const pct = Math.round((score / total) * 100);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
        <span className="text-3xl font-extrabold text-white">{pct}%</span>
      </div>
      <h3 className="text-xl font-bold mb-1">{pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Trying!'}</h3>
      <p className="text-sm text-gray-500 mb-6">{correct}/{questions.length} correct · {score}/{total} points · {Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-3"><p className="text-2xl font-bold text-primary">{correct}</p><p className="text-xs text-gray-500">Correct</p></div>
        <div className="glass-card p-3"><p className="text-2xl font-bold text-accent">{questions.length - correct}</p><p className="text-xs text-gray-500">Incorrect</p></div>
        <div className="glass-card p-3"><p className="text-2xl font-bold text-secondary">{score}</p><p className="text-xs text-gray-500">Points</p></div>
      </div>
    </motion.div>
  );
};

export { QuizPlayer };
