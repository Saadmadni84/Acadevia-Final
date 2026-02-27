import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const setDark = useThemeStore((s) => s.setDark);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('acadevia-theme');
    if (!stored) {
      setDark(prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  return <>{children}</>;
};

export { ThemeProvider };
