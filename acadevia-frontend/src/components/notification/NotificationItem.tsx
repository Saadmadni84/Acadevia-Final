import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Info,
  Trophy,
  FileText,
  Settings,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'info' | 'achievement' | 'quiz' | 'system';

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: {
    icon: Info,
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
  },
  achievement: {
    icon: Trophy,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
  },
  quiz: {
    icon: FileText,
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/40',
  },
  system: {
    icon: Settings,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
  },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationItem({
  id,
  type,
  title,
  message,
  timestamp,
  isRead,
  link,
  onDismiss,
  onMarkRead,
}: NotificationItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = typeConfig[type];
  const Icon = config.icon;
  const ago = useMemo(() => timeAgo(timestamp), [timestamp]);

  const handleClick = useCallback(() => {
    if (!isRead) onMarkRead?.(id);
    if (link) navigate(link);
  }, [id, isRead, link, navigate, onMarkRead]);

  const handleDismiss = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      onDismiss?.(id);
    },
    [id, onDismiss],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onDismiss?.(id);
      }}
      role="listitem"
      className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
        isRead
          ? 'border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
          : 'border-primary/20 bg-primary/10 hover:bg-primary/15 dark:border-primary/30 dark:bg-primary/20 dark:hover:bg-primary/25'
      }`}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${isRead ? '' : t('notification.unread', 'Unread') + ': '}${title}. ${message}. ${ago}`}
    >
      {/* Type Icon */}
      <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            isRead
              ? 'font-normal text-gray-700 dark:text-gray-300'
              : 'font-semibold text-gray-900 dark:text-white'
          }`}
        >
          {title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{message}</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{ago}</p>
      </div>

      {/* Unread dot & dismiss */}
      <div className="flex shrink-0 items-center gap-2">
        {!isRead && (
          <span
            className="h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded p-1 text-gray-300 opacity-0 transition hover:text-gray-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-gray-400"
            aria-label={t('notification.dismiss', 'Dismiss notification')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
