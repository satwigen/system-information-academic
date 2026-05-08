import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import DepartmentsClient from './DepartmentsClient';
import { roleBadgeColor } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminDepartmentsPage() {
  const supabase = createClient();
  const [{ data: departments }, { data: classes }, { data: subjects }, { data: heads }] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('classes').select('id, department_id'),
    supabase.from('subjects').select('id, department_id'),
    supabase.from('profiles').select('id, full_name').eq('role', 'HEAD'),
  ]);

  const classCount: Record<string, number> = {};
  (classes ?? []).forEach((c) => { classCount[c.department_id] = (classCount[c.department_id] ?? 0) + 1; });
  const subjectCount: Record<string, number> = {};
  (subjects ?? []).forEach((s) => { subjectCount[s.department_id] = (subjectCount[s.department_id] ?? 0) + 1; });

  return (
    <div>
      <Header title="Departments" description="Manage academic departments.">
        <Badge className={roleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>
      <DepartmentsClient
        departments={departments ?? []}
        heads={heads ?? []}
        classCount={classCount}
        subjectCount={subjectCount}
      />
    </div>
  );
}
