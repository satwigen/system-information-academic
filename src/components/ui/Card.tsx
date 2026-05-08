import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ children, className, onClick, hover, glass }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        glass
          ? 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-lg'
          : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-sm',
        hover && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
