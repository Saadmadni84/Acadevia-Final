import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { Button } from '@/components/ui/Button';
import type { Notification } from '@/types/notification.types';

const typeIcons: Record<string, string> = {
  quiz: '📝',
  badge: '🏆',
  streak: '🔥',
  course: '📚',
  leaderboard: '📊',
  system: '⚙️',
};

const NotificationItem: React.FC<{ notification: Notification; onRead: (id: string) => void }> = ({
  notification,
  onRead,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: 40 }}
    className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
      notification.isRead
        ? 'bg-gray-50 dark:bg-gray-800/40'
        : 'bg-primary/5 dark:bg-primary/10 border border-primary/20'
    }`}
  >
    <span className="text-xl mt-0.5">{typeIcons[notification.type] ?? '🔔'}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {new Date(notification.createdAt).toLocaleString()}
      </p>
    </div>
    {!notification.isRead && (
      <button
        onClick={() => onRead(notification.id)}
        className="shrink-0 mt-1 p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
        title="Mark as read"
      >
        <CheckCheck className="h-4 w-4" />
      </button>
    )}
  </motion.div>
);

const NotificationPanel: React.FC = () => {
  const { t } = useTranslation();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t('notifications.panel', 'Notifications')}
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} leftIcon={<CheckCheck className="h-4 w-4" />}>
            {t('notifications.markAllRead', 'Mark all read')}
          </Button>
        )}
      </div>

      <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">{t('notifications.empty', 'No notifications yet')}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markRead} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export { NotificationPanel };
