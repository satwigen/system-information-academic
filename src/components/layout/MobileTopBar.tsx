'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';

export default function MobileTopBar() {
  const { user } = useAuth();
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white">AIS</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar name={user.profile.fullName} size="sm" />
      </div>
    </div>
  );
}
