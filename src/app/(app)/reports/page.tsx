import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const { profile } = await requireSession();
  if (profile.role === 'STUDENT') redirect('/');

  const supabase = createClient();
  const [
    { data: departments },
    { data: classes },
    { data: subjects },
    { data: stats },
  ] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('classes').select('*').order('name'),
    supabase.from('subjects').select('*').order('name'),
    supabase.from('attendance_stats_by_class').select('*'),
  ]);

  return (
    <div>
      <Header title="Reports" description="Attendance summary and statistics per class." />
      <ReportsClient
        departments={departments ?? []}
        classes={classes ?? []}
        subjects={subjects ?? []}
        stats={stats ?? []}
      />
    </div>
  );
}
