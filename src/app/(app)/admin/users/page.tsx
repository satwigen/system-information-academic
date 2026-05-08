import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import UsersClient from './UsersClient';
import { roleBadgeColor } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const [{ data: users }, { data: departments }, { data: classes }] = await Promise.all([
    supabase.from('profiles').select('*').order('full_name'),
    supabase.from('departments').select('*').order('name'),
    supabase.from('classes').select('*').order('name'),
  ]);

  return (
    <div>
      <Header title="User Management" description="Create, edit, and delete users across all roles.">
        <Badge className={roleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>
      <UsersClient users={users ?? []} departments={departments ?? []} classes={classes ?? []} />
    </div>
  );
}
