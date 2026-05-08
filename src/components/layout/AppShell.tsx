import React from 'react';
import Sidebar from './Sidebar';
import FloatingDock from './FloatingDock';
import MobileTopBar from './MobileTopBar';
import MinuteTick from './MinuteTick';
import type { UserRole } from '@/types/database';

interface AppShellProps {
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  children: React.ReactNode;
}

export default function AppShell({ role, fullName, email, avatarUrl, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100">
      <MinuteTick />
      <Sidebar role={role} fullName={fullName} email={email} avatarUrl={avatarUrl} />
      <MobileTopBar role={role} fullName={fullName} avatarUrl={avatarUrl} />
      <main className="md:ml-[260px] transition-[margin] px-4 md:px-8 py-6 md:py-8 pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <FloatingDock role={role} />
    </div>
  );
}
