import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import SubjectsClient from './SubjectsClient';
import { roleBadgeColor } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminSubjectsPage() {
  const supabase = createClient();
  const [{ data: subjects }, { data: departments }] = await Promise.all([
    supabase.from('subjects').select('*').order('code'),
    supabase.from('departments').select('*').order('name'),
  ]);

  return (
    <div>
      <Header title="Courses" description="Manage courses (subjects) per department.">
        <Badge className={roleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>
      <SubjectsClient subjects={subjects ?? []} departments={departments ?? []} />
    </div>
  );
}
