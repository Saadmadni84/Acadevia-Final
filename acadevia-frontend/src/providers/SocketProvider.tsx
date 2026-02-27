import React, { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useSyncStore } from '@/stores/useSyncStore';
import { socketService } from '@/services/socket.service';
import type { GamificationEvent } from '@/types/gamification.types';
import type { Notification } from '@/types/notification.types';

const CHANNELS = ['leaderboard', 'notifications', 'gamification', 'sync', 'download'] as const;

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const addXP = useGamificationStore((s) => s.addXP);
  const unlockBadge = useGamificationStore((s) => s.unlockBadge);
  const incrementStreak = useGamificationStore((s) => s.incrementStreak);
  const queueAnimation = useGamificationStore((s) => s.queueAnimation);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setOnline = useSyncStore((s) => s.setOnline);
  const setStatus = useSyncStore((s) => s.setStatus);

  const backoffRef = useRef(1000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const handleGamificationEvent = useCallback(
    (event: GamificationEvent) => {
      switch (event.type) {
        case 'XP_GAINED':
          addXP(
            (event.data.amount as number) ?? 0,
            (event.data.source as string) ?? 'socket',
          );
          break;
        case 'BADGE_UNLOCKED':
          if (event.data.badge) unlockBadge(event.data.badge as never);
          break;
        case 'LEVEL_UP':
          queueAnimation(event);
          break;
        case 'STREAK_UPDATE':
          incrementStreak();
          queueAnimation(event);
          break;
        case 'DAILY_REWARD':
          queueAnimation(event);
          break;
      }
    },
    [addXP, unlockBadge, incrementStreak, queueAnimation],
  );

  const handleNotificationEvent = useCallback(
    (notification: Notification) => {
      addNotification(notification);
    },
    [addNotification],
  );

  const handleSyncEvent = useCallback(
    (data: { status?: string; isOnline?: boolean }) => {
      if (typeof data.isOnline === 'boolean') setOnline(data.isOnline);
      if (data.status) setStatus(data.status as never);
    },
    [setOnline, setStatus],
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketService.disconnect();
      clearReconnectTimer();
      backoffRef.current = 1000;
      return;
    }

    socketService.connect(accessToken);

    // Subscribe to channels
    CHANNELS.forEach((channel) => {
      socketService.emit('subscribe', { channel });
    });

    // Event listeners
    socketService.on('gamification', handleGamificationEvent as never);
    socketService.on('notification', handleNotificationEvent as never);
    socketService.on('sync', handleSyncEvent as never);

    socketService.on('disconnect', () => {
      const scheduleReconnect = () => {
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          const token = useAuthStore.getState().accessToken;
          if (token && useAuthStore.getState().isAuthenticated) {
            socketService.connect(token);
            backoffRef.current = Math.min(backoffRef.current * 2, 30000);
          }
        }, backoffRef.current);
      };
      scheduleReconnect();
    });

    socketService.on('connect', () => {
      backoffRef.current = 1000;
      clearReconnectTimer();
    });

    return () => {
      socketService.off('gamification');
      socketService.off('notification');
      socketService.off('sync');
      socketService.off('disconnect');
      socketService.off('connect');
      socketService.disconnect();
      clearReconnectTimer();
    };
  }, [
    isAuthenticated,
    accessToken,
    handleGamificationEvent,
    handleNotificationEvent,
    handleSyncEvent,
    clearReconnectTimer,
  ]);

  return <>{children}</>;
};

export { SocketProvider };
