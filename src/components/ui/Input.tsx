import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, className, id, ...rest },
  ref,
) {
  const uid = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={uid}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5"
        >
          {icon}
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={uid}
        className={cn(
          'border rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60',
          error
            ? 'border-red-400 dark:border-red-600'
            : 'border-slate-200 dark:border-slate-700',
          className,
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
});

export default Input;
