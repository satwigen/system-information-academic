import React from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, value, onChange, placeholder, className, label, id, ...rest },
  ref,
) {
  const uid = id ?? rest.name;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={uid}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={uid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-60"
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
});

export default Select;
