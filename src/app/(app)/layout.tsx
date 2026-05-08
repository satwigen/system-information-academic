import React from 'react';
import { requireSession } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, email } = await requireSession();

  return (
    <AppShell
      role={profile.role}
      fullName={profile.full_name}
      email={email}
      avatarUrl={profile.avatar_url}
    >
      {children}
    </AppShell>
  );
}
