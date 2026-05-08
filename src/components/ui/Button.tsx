import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 shadow-sm shadow-indigo-600/20',
  secondary:
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus:ring-emerald-500 shadow-sm shadow-emerald-500/20',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
  outline:
    'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
});

export default Button;
