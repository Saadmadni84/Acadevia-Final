import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES, getDashboardRoute } from '@/config/routes.config';
import type { UserRole } from '@/types/common.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user, accessToken } = useAuthStore();
  const location = useLocation();

  // Derive auth state from actual data — more robust than relying on isAuthenticated flag alone
  const effectivelyAuthenticated = isAuthenticated || !!(accessToken && user);

  console.log('[ProtectedRoute]', { isLoading, isAuthenticated, effectivelyAuthenticated, hasToken: !!accessToken, hasUser: !!user, path: location.pathname });

  if (isLoading) return <LoadingScreen />;

  if (!effectivelyAuthenticated) {
    console.warn('[ProtectedRoute] REDIRECTING TO LOGIN — not authenticated');
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={getDashboardRoute(user?.role)} replace />;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
