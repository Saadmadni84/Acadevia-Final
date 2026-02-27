import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'breadcrumb.dashboard',
  courses: 'breadcrumb.courses',
  lessons: 'breadcrumb.lessons',
  quiz: 'breadcrumb.quiz',
  games: 'breadcrumb.games',
  leaderboard: 'breadcrumb.leaderboard',
  profile: 'breadcrumb.profile',
  badges: 'breadcrumb.badges',
  settings: 'breadcrumb.settings',
  downloads: 'breadcrumb.downloads',
  notifications: 'breadcrumb.notifications',
  teacher: 'breadcrumb.teacher',
  admin: 'breadcrumb.admin',
  content: 'breadcrumb.content',
  upload: 'breadcrumb.upload',
  create: 'breadcrumb.create',
  students: 'breadcrumb.students',
  analytics: 'breadcrumb.analytics',
  schools: 'breadcrumb.schools',
  users: 'breadcrumb.users',
  system: 'breadcrumb.system',
};

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const labelKey = ROUTE_LABELS[segment];
      const label = labelKey ? t(labelKey, segment) : decodeURIComponent(segment);
      return { label: label.charAt(0).toUpperCase() + label.slice(1), path };
    });
  }, [location.pathname, t]);

  if (breadcrumbs.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      aria-label={t('breadcrumb.navigation', 'Breadcrumb')}
      className="mb-4"
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm" role="list">
        {/* Home */}
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-gray-500 transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={t('breadcrumb.home', 'Home')}
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t('breadcrumb.home', 'Home')}</span>
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.path} className="flex items-center">
              <ChevronRight
                className="mx-1 h-3.5 w-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600"
                aria-hidden="true"
              />

              {isLast ? (
                <span
                  className="truncate rounded-md px-1.5 py-0.5 font-medium text-gray-900 dark:text-gray-100 max-w-[8rem] sm:max-w-none"
                  aria-current="page"
                  title={crumb.label}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="truncate rounded-md px-1.5 py-0.5 text-gray-500 transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:text-primary-400 max-w-[6rem] sm:max-w-none"
                  title={crumb.label}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export { BreadcrumbNav };
