import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import MaterialsClient from './MaterialsClient';

export const dynamic = 'force-dynamic';

export default async function MaterialsPage() {
  const { profile } = await requireSession();
  // HEAD cannot see materials per PRD.
  if (profile.role === 'HEAD') redirect('/');

  const supabase = createClient();
  const [{ data: materials }, { data: classes }, { data: subjects }] = await Promise.all([
    supabase.from('materials').select('*').order('session_date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('classes').select('*').order('name'),
    supabase.from('subjects').select('*').order('name'),
  ]);

  return (
    <div>
      <Header title="Materials" description="Browse and download learning materials." />
      <MaterialsClient
        materials={materials ?? []}
        classes={classes ?? []}
        subjects={subjects ?? []}
        role={profile.role}
        userId={profile.id}
      />
    </div>
  );
}
