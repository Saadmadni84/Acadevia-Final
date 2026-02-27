import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { socketService } from '@/services/socket.service';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Notification } from '@/types/notification.types';

export function useNotifications() {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await notificationService.list({ page: 0, size: 20 });
      return data.data;
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) setNotifications(query.data.content);
  }, [query.data, setNotifications]);

  useEffect(() => {
    if (!userId) return;
    const handler = (notification: Notification) => addNotification(notification);
    socketService.on(`notifications:${userId}`, handler as never);
    return () => { socketService.off(`notifications:${userId}`, handler as never); };
  }, [userId, addNotification]);

  return query;
}
