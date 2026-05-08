import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import ClassesClient from './ClassesClient';
import { roleBadgeColor } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
  const supabase = createClient();
  const [{ data: classes }, { data: departments }] = await Promise.all([
    supabase.from('classes').select('*').order('name'),
    supabase.from('departments').select('*').order('name'),
  ]);

  return (
    <div>
      <Header title="Classes" description="Manage class cohorts per department.">
        <Badge className={roleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>
      <ClassesClient classes={classes ?? []} departments={departments ?? []} />
    </div>
  );
}
