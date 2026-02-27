import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Trophy, Gamepad2, Brain, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'lesson' | 'quiz' | 'badge' | 'game' | 'achievement' | 'level_up';
  title: string;
  description: string;
  xpEarned?: number;
  timestamp: string;
}

const activityConfig: Record<string, { icon: any; color: string; badgeColor: string }> = {
  lesson: { icon: BookOpen, color: 'text-[#5B2C6F] bg-[#5B2C6F]/10 dark:bg-[#5B2C6F]/15', badgeColor: 'bg-[#5B2C6F]/10 text-[#5B2C6F] dark:bg-[#5B2C6F]/20 dark:text-[#B98FD1]' },
  quiz: { icon: Brain, color: 'text-[#7B3F95] bg-[#7B3F95]/10 dark:bg-[#7B3F95]/15', badgeColor: 'bg-[#7B3F95]/10 text-[#7B3F95] dark:bg-[#7B3F95]/20 dark:text-[#B98FD1]' },
  badge: { icon: Award, color: 'text-[#D4A843] bg-[#D4A843]/10 dark:bg-[#D4A843]/15', badgeColor: 'bg-[#D4A843]/10 text-[#D4A843] dark:bg-[#D4A843]/20 dark:text-[#E0BE6A]' },
  game: { icon: Gamepad2, color: 'text-[#D4A843] bg-[#D4A843]/10 dark:bg-[#D4A843]/15', badgeColor: 'bg-[#D4A843]/10 text-[#D4A843] dark:bg-[#D4A843]/20 dark:text-[#E0BE6A]' },
  achievement: { icon: Trophy, color: 'text-[#E74C3C] bg-[#E74C3C]/10 dark:bg-[#E74C3C]/15', badgeColor: 'bg-[#E74C3C]/10 text-[#E74C3C] dark:bg-[#E74C3C]/20 dark:text-[#EE7B6E]' },
  level_up: { icon: Star, color: 'text-primary bg-primary/10', badgeColor: 'bg-primary/10 text-primary' },
};

const RecentActivity: React.FC<{ activities: Activity[]; className?: string }> = ({ activities, className }) => (
  <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm', className)}>
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your latest learning progress</p>
      </div>
      <Link to="#" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
        View All <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>

    <div className="space-y-2">
      {activities.slice(0, 5).map((a, i) => {
        const cfg = activityConfig[a.type] || activityConfig.lesson;
        const Icon = cfg.icon;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</p>
            </div>
            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
              {a.xpEarned && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  +{a.xpEarned} XP
                </span>
              )}
              <p className="text-[10px] text-gray-400">{a.timestamp}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export { RecentActivity };
