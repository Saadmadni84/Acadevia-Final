import React from 'react';
import { Toaster } from 'sonner';

const Toast: React.FC = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      className: 'bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 shadow-lg',
      duration: 4000,
    }}
    richColors
    closeButton
  />
);

export { Toast };
