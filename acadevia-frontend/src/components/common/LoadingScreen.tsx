import React from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Logo } from './Logo';

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark z-50">
    <Logo size="lg" className="mb-6" />
    <Spinner size="lg" />
    <p className="mt-4 text-sm text-gray-500 animate-pulse">Loading...</p>
  </div>
);

export { LoadingScreen };
