import React from 'react';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/types/database';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: AttendanceStatus;
}

function statusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'LATE':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'SICK':
      return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    case 'ABSENT':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  }
}

export default function Badge({ status, children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        status
          ? statusColor(status)
          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
        className,
      )}
      {...rest}
    >
      {children ?? status}
    </span>
  );
}
