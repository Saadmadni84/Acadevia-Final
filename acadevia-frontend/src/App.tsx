import React from 'react';
import { AppRouter } from './router/AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { SocketProvider } from './providers/SocketProvider';
import { SyncProvider } from './providers/SyncProvider';
import { GamificationProvider } from './providers/GamificationProvider';
import { SoundProvider } from './providers/SoundProvider';
import { I18nProvider } from './providers/I18nProvider';
import { OnlineStatusBanner } from './components/common/OnlineStatusBanner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toast } from './components/ui/Toast';

const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <AuthProvider>
            <SyncProvider>
              <SocketProvider>
                <GamificationProvider>
                  <SoundProvider>
                    <OnlineStatusBanner />
                    <AppRouter />
                    <Toast />
                  </SoundProvider>
                </GamificationProvider>
              </SocketProvider>
            </SyncProvider>
          </AuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
