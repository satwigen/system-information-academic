import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hover, glass, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        glass
          ? 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-lg'
          : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-sm',
        hover && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer',
        className,
      )}
      {...rest}
    />
  );
});

export default Card;
