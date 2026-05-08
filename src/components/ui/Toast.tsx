'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextType {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={cn(
                'pointer-events-auto min-w-[240px] max-w-sm px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg flex items-start gap-2 border',
                t.kind === 'success' &&
                  'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800',
                t.kind === 'error' &&
                  'bg-red-50 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
                t.kind === 'info' &&
                  'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700',
              )}
            >
              {t.kind === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {t.kind === 'error' && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {t.kind === 'info' && <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
