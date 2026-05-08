'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { SubjectSchema } from '@/lib/validation';
import type { SubjectRow } from '@/types/database';

export async function createSubjectAction(
  input: unknown,
): Promise<ActionResult<SubjectRow>> {
  const parsed = SubjectSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subjects')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/subjects');
  return ok(data);
}

export async function updateSubjectAction(
  id: string,
  input: unknown,
): Promise<ActionResult<SubjectRow>> {
  const parsed = SubjectSchema.partial().safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subjects')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/subjects');
  return ok(data);
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/admin/subjects');
  return ok(null);
}
