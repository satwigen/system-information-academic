import React from 'react';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function Header({ title, description, children }: HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 md:mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}
