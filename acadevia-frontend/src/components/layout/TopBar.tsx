import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useSyncStore } from '@/stores/useSyncStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { Avatar } from '@/components/ui/Avatar';
import { ROUTES } from '@/config/routes.config';
import {
  Search, Bell, Sun, Moon, Menu, LogOut, User, Settings, Wifi, WifiOff
} from 'lucide-react';

interface TopBarProps { onMenuClick: () => void; }

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { isOnline, status } = useSyncStore();
  const { isDark, toggle } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-64 lg:w-80">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs', isOnline ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20')}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="hidden sm:inline">{status === 'SYNCING' ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle theme">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button onClick={() => navigate(ROUTES.NOTIFICATIONS)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-accent text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Avatar name={user?.fullName || 'User'} src={user?.avatarUrl} size="sm" />
              <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">{user?.fullName}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button onClick={() => { navigate(ROUTES.PROFILE); setShowUserMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button onClick={() => { navigate(ROUTES.SETTINGS); setShowUserMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <hr className="border-gray-200 dark:border-gray-700 my-1" />
                <button onClick={() => { logout(); setShowUserMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-accent hover:bg-gray-50 dark:hover:bg-gray-800">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { TopBar };
