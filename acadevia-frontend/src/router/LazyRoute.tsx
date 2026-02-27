import React, { Suspense } from 'react';
import { LoadingScreen } from '@/components/common/LoadingScreen';

interface LazyRouteProps {
  component: React.LazyExoticComponent<React.FC>;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ component: Component }) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export { LazyRoute };
