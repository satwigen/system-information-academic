'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Dialog({ open, onClose, title, description, children, maxWidth = 'max-w-xl' }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={`pointer-events-auto w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden`}
            >
              <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                  {description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
