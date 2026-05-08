'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/lib/types';
import { Shield, Briefcase, GraduationCap, User } from 'lucide-react';

const ROLE_META: Record<Role, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  ADMIN: { label: 'Admin', icon: Shield },
  HEAD: { label: 'Head', icon: Briefcase },
  DOSEN: { label: 'Dosen', icon: GraduationCap },
  STUDENT: { label: 'Student', icon: User },
};

const ROLES: Role[] = ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'];

export default function RoleSwitcher() {
  const { role, switchRole } = useAuth();
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
        View as
      </p>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
        {ROLES.map((r) => {
          const active = role === r;
          const Icon = ROLE_META[r].icon;
          return (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={
                'flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ' +
                (active
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')
              }
            >
              <Icon className="w-3 h-3" />
              {ROLE_META[r].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
