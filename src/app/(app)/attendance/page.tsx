import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import AttendanceGrid from './AttendanceGrid';
import StudentAttendanceView from './StudentAttendanceView';
import { roleBadgeColor, roleLabel } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const { profile } = await requireSession();

  // HEAD is a supervisor and does not interact with attendance per PRD.
  if (profile.role === 'HEAD') redirect('/');

  if (profile.role === 'STUDENT') {
    return (
      <div>
        <Header title="My Attendance" description="Read-only view of your attendance records.">
          <Badge className={roleBadgeColor(profile.role)}>View Only</Badge>
        </Header>
        <StudentAttendanceView studentId={profile.id} />
      </div>
    );
  }

  // DOSEN / ADMIN: need the reference data.
  const supabase = createClient();
  const [{ data: departments }, { data: classes }, { data: subjects }] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('classes').select('*').order('name'),
    supabase.from('subjects').select('*').order('name'),
  ]);

  return (
    <div>
      <Header title="Attendance" description="Record student attendance for a session.">
        <Badge className={roleBadgeColor(profile.role)}>{roleLabel(profile.role)}</Badge>
      </Header>
      <AttendanceGrid
        departments={departments ?? []}
        classes={classes ?? []}
        subjects={subjects ?? []}
      />
    </div>
  );
}
