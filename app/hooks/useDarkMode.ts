'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved === 'dark' || (!saved && prefersDark);
  });
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const applyTheme = useCallback((dark: boolean) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      return;
    }

    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    applyTheme(isDark);
  }, [applyTheme, isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((previous) => !previous);
  }, []);

  return {
    isDark,
    mounted,
    toggleTheme,
  };
};
