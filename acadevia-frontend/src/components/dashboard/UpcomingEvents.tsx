import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type EventType = 'quiz' | 'deadline' | 'class';

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  courseName?: string;
}

interface UpcomingEventsProps {
  events?: UpcomingEvent[];
  viewAllLink?: string;
}

const typeConfig: Record<EventType, { icon: typeof Calendar; color: string; bg: string; label: string }> = {
  quiz: {
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    label: 'Quiz',
  },
  deadline: {
    icon: Clock,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/40',
    label: 'Deadline',
  },
  class: {
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    label: 'Class',
  },
};

function getCountdown(dateStr: string): string {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UpcomingEvents({ events = [], viewAllLink = '/events' }: UpcomingEventsProps) {
  const { t } = useTranslation();

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events],
  );

  const nearest = sortedEvents[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      aria-label={t('dashboard.upcomingEvents', 'Upcoming Events')}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.upcomingEvents', 'Upcoming Events')}
        </h2>
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {t('common.viewAll', 'View All')}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Countdown for nearest event */}
      {nearest && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`mb-4 rounded-lg p-3 ${typeConfig[nearest.type].bg}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className={`h-4 w-4 ${typeConfig[nearest.type].color}`} aria-hidden="true" />
              <span className={`text-sm font-semibold ${typeConfig[nearest.type].color}`}>
                {t('dashboard.nextUp', 'Next Up')}
              </span>
            </div>
            <span className={`text-lg font-bold ${typeConfig[nearest.type].color}`}>
              {getCountdown(nearest.date)}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{nearest.title}</p>
        </motion.div>
      )}

      {/* Event List */}
      {sortedEvents.length > 0 ? (
        <ul className="space-y-3" role="list">
          {sortedEvents.map((event, idx) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;
            return (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-750"
              >
                <div className={`rounded-lg p-2 ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(event.date)}
                    {event.courseName && ` · ${event.courseName}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}
                >
                  {t(`dashboard.eventType.${event.type}`, config.label)}
                </span>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          {t('dashboard.noEvents', 'No upcoming events')}
        </p>
      )}
    </motion.section>
  );
}
