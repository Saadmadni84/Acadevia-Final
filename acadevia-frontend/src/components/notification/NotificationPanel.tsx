import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Award, BookOpen, Trophy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'achievement' | 'course' | 'leaderboard' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const typeIcons: Record<string, any> = {
  achievement: Award,
  course: BookOpen,
  leaderboard: Trophy,
  message: MessageSquare,
  system: Bell,
};
const typeColors: Record<string, string> = {
  achievement: 'bg-yellow-50 text-yellow-500 dark:bg-yellow-500/10',
  course: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10',
  leaderboard: 'bg-purple-50 text-purple-500 dark:bg-purple-500/10',
  message: 'bg-green-50 text-green-500 dark:bg-green-500/10',
  system: 'bg-gray-50 text-gray-500 dark:bg-gray-500/10',
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose, notifications, onMarkRead, onMarkAllRead }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-80 sm:w-96 glass-card shadow-2xl rounded-2xl overflow-hidden z-50"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              <button onClick={onMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1"><CheckCheck className="h-3 w-3" />Mark all read</button>
              <button onClick={onClose}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500"><Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />No notifications</div>
            ) : notifications.map(n => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <button key={n.id} onClick={() => onMarkRead(n.id)} className={cn('w-full text-left p-4 flex gap-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors', !n.read && 'bg-primary/5')}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.timestamp}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export { NotificationPanel };
