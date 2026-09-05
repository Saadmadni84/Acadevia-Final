import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { LEVEL_NAMES } from '@/lib/constants';
import { XPHistoryModal } from '@/components/dashboard/XPHistoryModal';
import {
  Home, BookOpen, Trophy, User, Settings,
  Download, ChevronLeft, ChevronRight,
  GraduationCap, BarChart3, Users, Shield, Brain, Swords, Star, Award
} from 'lucide-react';

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

interface NavGroup {
  label: string;
  items: {
    to: string;
    icon: React.ElementType;
    label: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { xp, level } = useGamificationStore();
  const role = user?.role || 'STUDENT';
  const [isXPOpen, setIsXPOpen] = useState(false);

  const resolvedXP = xp > 0 ? xp : 720;
  const resolvedLevel = level > 1 ? level : 4;
  const nextThreshold = 1000;
  const progressPercent = Math.min(100, Math.round((resolvedXP / nextThreshold) * 100));
  const xpNeeded = Math.max(0, nextThreshold - resolvedXP);

  const studentGroups: NavGroup[] = [
    {
      label: 'LEARN',
      items: [
        { to: ROUTES.DASHBOARD, icon: Home, label: 'Dashboard' },
        { to: ROUTES.COURSES, icon: BookOpen, label: 'My Learning' },
        { to: ROUTES.QUIZZES, icon: GraduationCap, label: 'Quizzes' },
      ],
    },
    {
      label: 'COMPETE',
      items: [
        { to: ROUTES.GAMES, icon: Swords, label: 'Challenges' },
        { to: ROUTES.LEADERBOARD, icon: Trophy, label: 'Leaderboard' },
      ],
    },
    {
      label: 'PROGRESS',
      items: [
        { to: ROUTES.PROFILE, icon: BarChart3, label: 'Progress' },
        { to: ROUTES.BADGES, icon: Award, label: 'Achievements' },
      ],
    },
    {
      label: 'OTHER',
      items: [
        { to: ROUTES.DOWNLOADS, icon: Download, label: 'Downloads' },
        { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
      ],
    },
  ];

  const teacherLinks = [
    { to: ROUTES.TEACHER_DASHBOARD, icon: Home, label: 'Dashboard' },
    { to: ROUTES.TEACHER_CONTENT_UPLOAD, icon: BookOpen, label: 'Upload Content' },
    { to: ROUTES.TEACHER_QUIZ_CREATE, icon: GraduationCap, label: 'Create Quiz' },
    { to: ROUTES.TEACHER_STUDENTS, icon: Users, label: 'Students' },
    { to: ROUTES.TEACHER_ANALYTICS, icon: BarChart3, label: 'Analytics' },
    { to: ROUTES.PROFILE, icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: Home, label: 'Dashboard' },
    { to: ROUTES.ADMIN_SCHOOLS, icon: GraduationCap, label: 'Schools' },
    { to: ROUTES.ADMIN_USERS, icon: Users, label: 'Users' },
    { to: ROUTES.ADMIN_CONTENT, icon: BookOpen, label: 'Content' },
    { to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, label: 'Analytics' },
    { to: ROUTES.ADMIN_SYSTEM, icon: Shield, label: 'System' },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        className="hidden lg:flex flex-col h-screen bg-[#FDFCF9] dark:bg-card-dark border-r border-[#E7E1D8] dark:border-[#382447] fixed left-0 top-0 z-30"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E7E1D8] dark:border-[#382447]">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-base shadow-xs">
                  A
                </div>
                <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Acadevia
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300 cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {role === 'STUDENT' ? (
            studentGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                {!collapsed && (
                  <span className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {group.label}
                  </span>
                )}
                {group.items.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary dark:text-purple-300 font-bold border border-primary/20'
                          : 'text-[#647084] dark:text-gray-400 hover:text-[#172033] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                            {link.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  );
                })}
              </div>
            ))
          ) : (
            (role === 'ADMIN' ? adminLinks : teacherLinks).map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary dark:text-purple-300 font-bold border border-primary/20'
                      : 'text-[#647084] dark:text-gray-400 hover:text-[#172033] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })
          )}
        </nav>

        {/* Level Status Card at Bottom */}
        {role === 'STUDENT' && (
          <div className="p-3 border-t border-[#E8E2D8] dark:border-[#382447]">
            {!collapsed ? (
              <div
                onClick={() => setIsXPOpen(true)}
                className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-primary/25 hover:border-primary/50 transition-all cursor-pointer space-y-2 group shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                      Level {resolvedLevel}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-primary dark:text-purple-300 uppercase tracking-wider">
                    Explorer
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    <span>{resolvedXP} / {nextThreshold} XP</span>
                    <span className="text-primary dark:text-purple-300">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold pt-0.5">
                    {xpNeeded} XP to Level {resolvedLevel + 1}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsXPOpen(true)}
                className="w-full py-2 flex items-center justify-center text-primary dark:text-purple-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
                title={`Level ${resolvedLevel} Explorer • ${resolvedXP} XP`}
              >
                <Star className="h-5 w-5 text-warning fill-warning" />
              </button>
            )}
          </div>
        )}
      </motion.aside>

      <XPHistoryModal
        isOpen={isXPOpen}
        onClose={() => setIsXPOpen(false)}
        currentXP={resolvedXP}
        level={resolvedLevel}
        levelTitle={LEVEL_NAMES[resolvedLevel - 1] || 'Explorer'}
      />
    </>
  );
};

export { Sidebar };
export default Sidebar;
