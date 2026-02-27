import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/config/routes.config';
import type { UserRole } from '@/types/common.types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackPath?: string;
}

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  STUDENT: ROUTES.DASHBOARD,
  TEACHER: ROUTES.TEACHER_DASHBOARD,
  ADMIN: ROUTES.ADMIN_DASHBOARD,
};

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallbackPath }) => {
  const { user, isLoading, isAuthenticated, accessToken } = useAuthStore();
  const location = useLocation();
  const effectivelyAuthenticated = isAuthenticated || !!(accessToken && user);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!effectivelyAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    const redirectTo = fallbackPath ?? ROLE_DASHBOARDS[user.role as UserRole] ?? ROUTES.DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export { RoleGuard };
