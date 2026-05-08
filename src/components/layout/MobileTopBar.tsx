'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import { roleLabel } from '@/lib/rbac';
import type { UserRole } from '@/types/database';

interface Props {
  role: UserRole;
  fullName: string;
  avatarUrl: string | null;
}

export default function MobileTopBar({ role, fullName, avatarUrl }: Props) {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight">
          <span className="font-bold text-slate-900 dark:text-white block text-sm">SIAKAD</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{roleLabel(role)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar name={fullName} src={avatarUrl} size="sm" />
      </div>
    </div>
  );
}
