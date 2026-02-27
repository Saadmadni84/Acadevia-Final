import React from 'react';
import { motion } from 'framer-motion';
import { Target, Check, BookOpen, Brain, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'game' | 'xp';
  current: number;
  target: number;
  completed: boolean;
}

interface DailyGoalProgressProps {
  goals: Goal[];
  className?: string;
}

const goalIcons = { lesson: BookOpen, quiz: Brain, game: Gamepad2, xp: Target };
const goalColors = {
  lesson: 'text-[#5B2C6F] bg-[#5B2C6F]/10 dark:bg-[#5B2C6F]/15',
  quiz: 'text-[#7B3F95] bg-[#7B3F95]/10 dark:bg-[#7B3F95]/15',
  game: 'text-[#D4A843] bg-[#D4A843]/10 dark:bg-[#D4A843]/15',
  xp: 'text-[#E74C3C] bg-[#E74C3C]/10 dark:bg-[#E74C3C]/15',
};

const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({ goals, className }) => {
  const completed = goals.filter(g => g.completed).length;
  const pct = goals.length ? (completed / goals.length) * 100 : 0;

  return (
    <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daily Goals</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{completed}/{goals.length}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-secondary to-[#E0BE6A] rounded-full" />
      </div>
      <div className="space-y-2">
        {goals.map((goal, i) => {
          const Icon = goalIcons[goal.type];
          const colorCls = goalColors[goal.type];
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-xl transition-colors',
                goal.completed ? 'bg-secondary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                goal.completed ? 'bg-secondary/10' : colorCls
              )}>
                {goal.completed ? <Check className="h-4 w-4 text-secondary" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', goal.completed && 'line-through text-gray-400')}>{goal.title}</p>
                <p className="text-xs text-gray-400">{goal.current}/{goal.target}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export { DailyGoalProgress };
