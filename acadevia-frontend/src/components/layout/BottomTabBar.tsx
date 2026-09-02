import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes.config';
import { Home, BookOpen, Gamepad2, Trophy, User } from 'lucide-react';

const BottomTabBar: React.FC = () => {
  const { t } = useTranslation();

  const tabs = [
    { to: ROUTES.DASHBOARD, icon: Home, label: t('nav.home') },
    { to: ROUTES.COURSES, icon: BookOpen, label: t('nav.courses') },
    { to: ROUTES.GAMES, icon: Gamepad2, label: t('nav.games') },
    { to: ROUTES.LEADERBOARD, icon: Trophy, label: t('nav.leaderboard') },
    { to: ROUTES.PROFILE, icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FDFCF9] dark:bg-card-dark border-t border-[#E7E1D8] dark:border-[#382447] safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[56px]',
              isActive ? 'text-primary font-bold' : 'text-[#647084] dark:text-gray-400'
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export { BottomTabBar };
export default BottomTabBar;
