import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Mail, Star, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface ProfileSummaryCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  streak: number;
  className?: string;
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  name,
  email: _email,
  avatarUrl,
  level,
  xp,
  streak,
  className,
}) => {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        'rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Gradient header */}
      <div className="relative h-20 bg-gradient-to-r from-primary via-[#7B3F95] to-secondary">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-4 w-12 h-12 border border-white/30 rounded-full" />
          <div className="absolute bottom-2 left-8 w-8 h-8 border border-white/20 rounded-lg rotate-45" />
        </div>
      </div>

      {/* Avatar overlapping header */}
      <div className="px-5 -mt-8 relative z-10">
        <div className="relative inline-block">
          <div className="ring-4 ring-white dark:ring-card-dark rounded-full">
            <Avatar name={name} src={avatarUrl} size="lg" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-secondary rounded-full border-2 border-white dark:border-card-dark flex items-center justify-center">
            <Star className="h-2.5 w-2.5 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pt-3 pb-5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {greeting}, {name.split(' ')[0]}!
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Continue your journey & achieve your goals
        </p>

        {/* Quick action buttons */}
        <div className="flex gap-2 mt-4">
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="h-4 w-4 text-gray-500" />
          </Link>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Mail className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 rounded-xl bg-primary/5">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{xp}</p>
            <p className="text-[10px] text-gray-500">XP</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-secondary/5">
            <TrendingUp className="h-4 w-4 text-secondary mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">Lv.{level}</p>
            <p className="text-[10px] text-gray-500">Level</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-orange-500/5">
            <Star className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{streak}</p>
            <p className="text-[10px] text-gray-500">Streak</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { ProfileSummaryCard };
