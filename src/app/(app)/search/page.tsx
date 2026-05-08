import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import SearchClient from './SearchClient';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const { profile } = await requireSession();
  if (profile.role === 'STUDENT') redirect('/');

  const supabase = createClient();
  const [{ data: departments }, { data: classes }] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('classes').select('*').order('name'),
  ]);

  return (
    <div>
      <Header title="Search" description="Find students and lecturers across the institution." />
      <SearchClient departments={departments ?? []} classes={classes ?? []} />
    </div>
  );
}
