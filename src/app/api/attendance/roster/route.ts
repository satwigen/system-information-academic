import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Returns the roster and existing attendance records for a class/subject/date.
 * Used by the DOSEN attendance page client component.
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('class_id');
  const subjectId = searchParams.get('subject_id');
  const sessionDate = searchParams.get('session_date');
  if (!classId || !subjectId || !sessionDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const [{ data: students }, { data: records }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('class_id', classId)
      .eq('role', 'STUDENT')
      .order('full_name'),
    supabase
      .from('attendance_records')
      .select('*')
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .eq('session_date', sessionDate),
  ]);

  return NextResponse.json({ students: students ?? [], records: records ?? [] });
}
