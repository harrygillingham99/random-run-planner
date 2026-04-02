'use client';

import { useCallback, useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);

    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);

    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setIsDark((previous) => {
      const next = !previous;
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  return {
    isDark,
    mounted,
    toggleTheme,
  };
};
