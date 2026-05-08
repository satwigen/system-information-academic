'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'siakad-theme';

function applyThemeClass(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (typeof localStorage !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null)
      : null) || 'system';
    setThemeState(stored);
    const resolved = resolveTheme(stored);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
  }, []);

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved: 'light' | 'dark' = mq.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyThemeClass(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
