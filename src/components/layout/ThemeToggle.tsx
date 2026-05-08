'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import ClientOnly from '@/components/ui/ClientOnly';

function ThemeButton() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export default function ThemeToggle() {
  return (
    <ClientOnly
      fallback={
        <button
          aria-label="Toggle theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Moon className="w-4 h-4" />
        </button>
      }
    >
      <ThemeButton />
    </ClientOnly>
  );
}
