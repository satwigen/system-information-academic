import React from 'react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface BadgeProps {
  status?: AttendanceStatus;
  children?: React.ReactNode;
  className?: string;
}

export default function Badge({ status, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        status ? getStatusColor(status) : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
        className
      )}
    >
      {children ?? (status ? getStatusLabel(status) : null)}
    </span>
  );
}
