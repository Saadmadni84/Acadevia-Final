import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { SyncProvider } from '@/providers/SyncProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { GamificationProvider } from '@/providers/GamificationProvider';
import { SoundProvider } from '@/providers/SoundProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSyncStore } from '@/stores/useSyncStore';

const AuthSyncInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setLoading } = useAuthStore();
  const { setOnline } = useSyncStore();

  useEffect(() => {
    // Check auth state on mount
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    // Sync online/offline status
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return <>{children}</>;
};

const RootLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <SyncProvider>
            <SocketProvider>
              <GamificationProvider>
                <SoundProvider>
                  <AuthSyncInitializer>
                    <Outlet />
                  </AuthSyncInitializer>
                </SoundProvider>
              </GamificationProvider>
            </SocketProvider>
          </SyncProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

export { RootLayout };
