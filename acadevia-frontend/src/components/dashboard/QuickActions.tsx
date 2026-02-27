import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Download, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes.config';

const actions = [
  { to: ROUTES.COURSES, icon: BookOpen, label: 'Courses', color: 'bg-[#5B2C6F]', lightBg: 'bg-[#5B2C6F]/5 dark:bg-[#5B2C6F]/10' },
  { to: ROUTES.GAMES, icon: Gamepad2, label: 'Games', color: 'bg-[#D4A843]', lightBg: 'bg-[#D4A843]/5 dark:bg-[#D4A843]/10' },
  { to: ROUTES.LEADERBOARD, icon: Trophy, label: 'Leaderboard', color: 'bg-[#7B3F95]', lightBg: 'bg-[#7B3F95]/5 dark:bg-[#7B3F95]/10' },
  { to: ROUTES.DOWNLOADS, icon: Download, label: 'Downloads', color: 'bg-[#E74C3C]', lightBg: 'bg-[#E74C3C]/5 dark:bg-[#E74C3C]/10' },
];

const QuickActions: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-sm', className)}>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-2">
      {actions.map((a, i) => (
        <motion.div key={a.to} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
          <Link to={a.to} className={cn('flex items-center gap-2.5 p-3 rounded-xl transition-all hover:shadow-md group', a.lightBg)}>
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform', a.color)}>
              <a.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{a.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export { QuickActions };
