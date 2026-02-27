import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type Scope = 'school' | 'city' | 'state' | 'national';

interface ScopeConfig {
  key: Scope;
  label: string;
  count?: number;
}

interface LeaderboardScopeTabProps {
  activeScope: Scope;
  scopes?: ScopeConfig[];
  onScopeChange: (scope: Scope) => void;
  className?: string;
}

const defaultScopes: ScopeConfig[] = [
  { key: 'school', label: 'School' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'national', label: 'National' },
];

const LeaderboardScopeTab: React.FC<LeaderboardScopeTabProps> = ({
  activeScope,
  scopes,
  onScopeChange,
  className,
}) => {
  const { t } = useTranslation();
  const resolvedScopes = scopes ?? defaultScopes;

  return (
    <div
      className={cn(
        'relative flex overflow-x-auto scrollbar-hide',
        'border-b border-gray-200 dark:border-gray-700',
        className
      )}
      role="tablist"
      aria-label={t('leaderboard.scope', 'Leaderboard scope')}
    >
      {resolvedScopes.map((scope) => {
        const isActive = activeScope === scope.key;
        return (
          <button
            key={scope.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onScopeChange(scope.key)}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              isActive
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {t(`leaderboard.scope.${scope.key}`, scope.label)}

            {scope.count != null && (
              <span
                className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                )}
              >
                {scope.count > 999 ? '999+' : scope.count}
              </span>
            )}

            {/* Animated underline */}
            {isActive && (
              <motion.div
                layoutId="scope-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export { LeaderboardScopeTab };
export type { Scope, ScopeConfig };
