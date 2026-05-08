import React from 'react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface BadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
