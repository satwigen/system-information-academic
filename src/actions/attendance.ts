'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { MarkAttendanceSchema, MarkAllPresentSchema } from '@/lib/validation';
import type { AttendanceRecordRow } from '@/types/database';

/**
 * Dosen-only: upsert a single attendance record.
 * Students are blocked by RLS even if they somehow invoke this action.
 */
export async function markAttendanceAction(
  input: unknown,
): Promise<ActionResult<AttendanceRecordRow>> {
  const parsed = MarkAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(
      { ...parsed.data, recorded_by_id: user.id },
      { onConflict: 'student_id,class_id,subject_id,session_date' },
    )
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/attendance');
  revalidatePath('/reports');
  return ok(data);
}

/**
 * Dosen-only: mark all students of a class PRESENT for the session.
 */
export async function markAllPresentAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const parsed = MarkAllPresentSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data: students, error: listErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('class_id', parsed.data.class_id)
    .eq('role', 'STUDENT');

  if (listErr) return fail(mapDbError(listErr));
  if (!students || students.length === 0) return ok({ count: 0 });

  const rows = students.map((s) => ({
    student_id: s.id,
    class_id: parsed.data.class_id,
    subject_id: parsed.data.subject_id,
    session_date: parsed.data.session_date,
    status: 'PRESENT' as const,
    recorded_by_id: user.id,
  }));

  const { error: insertErr } = await supabase
    .from('attendance_records')
    .upsert(rows, { onConflict: 'student_id,class_id,subject_id,session_date' });

  if (insertErr) return fail(mapDbError(insertErr));
  revalidatePath('/attendance');
  revalidatePath('/reports');
  return ok({ count: students.length });
}
