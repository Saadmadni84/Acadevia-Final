import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useSyncStore } from '@/stores/useSyncStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { Avatar } from '@/components/ui/Avatar';
import { ROUTES } from '@/config/routes.config';
import { GlobalSearchModal } from '@/components/dashboard/GlobalSearchModal';
import { XPHistoryModal } from '@/components/dashboard/XPHistoryModal';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import {
  Search, Bell, Sun, Moon, Menu, LogOut, User, Settings, Wifi, WifiOff, Zap, Flame
} from 'lucide-react';

interface TopBarProps { onMenuClick: () => void; }

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { xp, level, streak } = useGamificationStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { isOnline, status } = useSyncStore();
  const { isDark, toggle } = useThemeStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);

  const resolvedXP = xp > 0 ? xp : 720;
  const resolvedLevel = level > 1 ? level : 4;
  const resolvedStreak = streak > 0 ? streak : 5;

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#FDFCF9]/90 dark:bg-card-dark/90 backdrop-blur-xl border-b border-[#E8E2D8] dark:border-[#382447]">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Mobile Menu & Global Search Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300 cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Clickable Search Input opening Command Palette */}
            <div
              onClick={() => setShowSearchModal(true)}
              className="hidden md:flex items-center bg-white dark:bg-card-dark border border-[#E8E2D8] dark:border-[#382447] rounded-xl px-3 py-2 w-64 lg:w-80 shadow-2xs hover:border-primary/50 cursor-pointer transition-colors"
            >
              <Search className="h-4 w-4 text-[#647084] mr-2" />
              <span className="text-xs font-medium text-[#647084] flex-1">
                Search courses, quizzes, quests...
              </span>
              <kbd className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Sync, Theme, Streak, XP Status Pill, Notifications, Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Sync Status Badge */}
            <div className={cn('hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', isOnline ? 'text-success bg-success/10 border border-success/20' : 'text-accent bg-accent/10 border border-accent/20')}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="hidden md:inline">{status === 'SYNCING' ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Language Selector (Google Translate) */}
            <LanguageSelector variant="minimal" />

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Streak Status Pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/40 text-streak text-xs font-extrabold shadow-2xs select-none"
              title={`${resolvedStreak} Day Learning Streak`}
            >
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>{resolvedStreak}d</span>
            </div>

            {/* XP Status Pill (Opens XP History Modal) */}
            <button
              onClick={() => setShowXPModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-primary/25 text-primary dark:text-purple-300 text-xs font-black shadow-2xs hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="View XP & Progression History"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{resolvedXP} XP</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => navigate(ROUTES.NOTIFICATIONS)}
              className="relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute 1 top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <Avatar name={user?.fullName || 'Aarav Sharma'} src={user?.avatarUrl} size="sm" />
                <span className="hidden md:block text-xs font-bold truncate max-w-[120px] text-[#172033] dark:text-gray-200">
                  {user?.fullName?.split(' ')[0] || 'Aarav'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-[#E8E2D8] dark:border-[#382447] py-1 z-50">
                  <button
                    onClick={() => { navigate(ROUTES.PROFILE); setShowUserMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs hover:bg-[#F8F5EF] dark:hover:bg-white/5 text-[#172033] dark:text-gray-200 font-bold cursor-pointer"
                  >
                    <User className="h-4 w-4 text-primary" /> Profile & Progress
                  </button>
                  <button
                    onClick={() => { navigate(ROUTES.SETTINGS); setShowUserMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs hover:bg-[#F8F5EF] dark:hover:bg-white/5 text-[#172033] dark:text-gray-200 font-bold cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-primary" /> Settings
                  </button>
                  <hr className="border-[#E8E2D8] dark:border-[#382447] my-1" />
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-accent hover:bg-accent/10 font-bold cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Command Palette */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* XP Progression Modal */}
      <XPHistoryModal
        isOpen={showXPModal}
        onClose={() => setShowXPModal(false)}
        currentXP={resolvedXP}
        level={resolvedLevel}
        levelTitle="Explorer"
      />
    </>
  );
};

export { TopBar };
export default TopBar;
