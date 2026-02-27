import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Progress } from '@/components/ui/Progress';
import { getXPForNextLevel, LEVEL_NAMES } from '@/lib/constants';
import {
  Home, BookOpen, Gamepad2, Trophy, User, Settings,
  Download, ChevronLeft, ChevronRight, Flame,
  GraduationCap, BarChart3, Users, Shield
} from 'lucide-react';

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { xp, level, streak } = useGamificationStore();
  const xpInfo = getXPForNextLevel(xp);
  const role = user?.role || 'STUDENT';

  const studentLinks = [
    { to: ROUTES.DASHBOARD, icon: Home, label: t('nav.home') },
    { to: ROUTES.COURSES, icon: BookOpen, label: t('nav.courses') },
    { to: ROUTES.GAMES, icon: Gamepad2, label: t('nav.games') },
    { to: ROUTES.LEADERBOARD, icon: Trophy, label: t('nav.leaderboard') },
    { to: ROUTES.DOWNLOADS, icon: Download, label: t('nav.downloads') },
    { to: ROUTES.PROFILE, icon: User, label: t('nav.profile') },
    { to: ROUTES.SETTINGS, icon: Settings, label: t('nav.settings') },
  ];

  const teacherLinks = [
    { to: ROUTES.TEACHER_DASHBOARD, icon: Home, label: 'Dashboard' },
    { to: ROUTES.TEACHER_CONTENT_UPLOAD, icon: BookOpen, label: 'Upload Content' },
    { to: ROUTES.TEACHER_QUIZ_CREATE, icon: GraduationCap, label: 'Create Quiz' },
    { to: ROUTES.TEACHER_STUDENTS, icon: Users, label: 'Students' },
    { to: ROUTES.TEACHER_ANALYTICS, icon: BarChart3, label: 'Analytics' },
  ];

  const adminLinks = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: Home, label: 'Dashboard' },
    { to: ROUTES.ADMIN_SCHOOLS, icon: GraduationCap, label: 'Schools' },
    { to: ROUTES.ADMIN_USERS, icon: Users, label: 'Users' },
    { to: ROUTES.ADMIN_CONTENT, icon: BookOpen, label: 'Content' },
    { to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, label: 'Analytics' },
    { to: ROUTES.ADMIN_SYSTEM, icon: Shield, label: 'System' },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'TEACHER' ? teacherLinks : studentLinks;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      className="hidden lg:flex flex-col h-screen bg-white dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 z-30"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xl font-bold gradient-text">
              Acadevia
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <link.icon className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {role === 'STUDENT' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {streak > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent animate-pulse" />
              {!collapsed && <span className="text-sm font-medium">{streak} {t('dashboard.streak', { count: streak })}</span>}
            </div>
          )}
          {!collapsed && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Level {level} — {LEVEL_NAMES[level - 1]}</span>
                <span>{xpInfo.current}/{xpInfo.needed} XP</span>
              </div>
              <Progress value={xpInfo.current} max={xpInfo.needed} gradient size="sm" />
            </div>
          )}
        </div>
      )}
    </motion.aside>
  );
};

export { Sidebar };
