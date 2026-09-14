import React from 'react';
import { Toaster } from 'sonner';

const Toast: React.FC = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      className: 'bg-white dark:bg-[#050505] text-gray-900 dark:text-[#F5F5F5] border border-gray-200 dark:border-[#242424] shadow-lg',
      duration: 4000,
    }}
    richColors
    closeButton
  />
);

export { Toast };
