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
    <header className="sticky top-0 z-20 bg-[#FDFCF9]/90 dark:bg-card-dark/90 backdrop-blur-xl border-b border-[#E7E1D8] dark:border-[#382447]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center bg-white dark:bg-card-dark border border-[#E7E1D8] dark:border-[#382447] rounded-xl px-3 py-2 w-64 lg:w-80 shadow-2xs">
            <Search className="h-4 w-4 text-[#647084] mr-2" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-[#647084] text-[#172033] dark:text-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', isOnline ? 'text-success bg-success/10 border border-success/20' : 'text-accent bg-accent/10 border border-accent/20')}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="hidden sm:inline">{status === 'SYNCING' ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button onClick={toggle} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300" aria-label="Toggle theme">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button onClick={() => navigate(ROUTES.NOTIFICATIONS)} className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#172033] dark:text-gray-300" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-accent text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
              <Avatar name={user?.fullName || 'User'} src={user?.avatarUrl} size="sm" />
              <span className="hidden md:block text-sm font-semibold truncate max-w-[120px] text-[#172033] dark:text-gray-200">{user?.fullName}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-[#E7E1D8] dark:border-[#382447] py-1 z-50">
                <button onClick={() => { navigate(ROUTES.PROFILE); setShowUserMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-[#F8F5EF] dark:hover:bg-white/5 text-[#172033] dark:text-gray-200 font-medium">
                  <User className="h-4 w-4 text-primary" /> Profile
                </button>
                <button onClick={() => { navigate(ROUTES.SETTINGS); setShowUserMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-[#F8F5EF] dark:hover:bg-white/5 text-[#172033] dark:text-gray-200 font-medium">
                  <Settings className="h-4 w-4 text-primary" /> Settings
                </button>
                <hr className="border-[#E7E1D8] dark:border-[#382447] my-1" />
                <button onClick={() => { logout(); setShowUserMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-accent hover:bg-accent/10 font-medium">
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
export default TopBar;
