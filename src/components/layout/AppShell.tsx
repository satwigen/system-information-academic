'use client';

import React from 'react';
import Sidebar from './Sidebar';
import FloatingDock from './FloatingDock';
import MobileTopBar from './MobileTopBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100">
      <Sidebar />
      <MobileTopBar />
      <main className="md:ml-[260px] transition-[margin] px-4 md:px-8 py-6 md:py-8 pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <FloatingDock />
    </div>
  );
}
