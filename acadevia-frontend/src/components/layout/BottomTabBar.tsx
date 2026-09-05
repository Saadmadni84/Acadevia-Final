import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes.config';
import { Home, BookOpen, Brain, Swords, User } from 'lucide-react';

const BottomTabBar: React.FC = () => {
  const tabs = [
    { to: ROUTES.DASHBOARD, icon: Home, label: 'Home' },
    { to: ROUTES.COURSES, icon: BookOpen, label: 'Learn' },
    { to: ROUTES.QUIZZES, icon: Brain, label: 'Quizzes' },
    { to: ROUTES.GAMES, icon: Swords, label: 'Compete' },
    { to: ROUTES.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FDFCF9] dark:bg-card-dark border-t border-[#E8E2D8] dark:border-[#382447] safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[56px]',
              isActive ? 'text-primary dark:text-purple-300 font-bold' : 'text-[#647084] dark:text-gray-400'
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[11px] font-semibold">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export { BottomTabBar };
export default BottomTabBar;
