'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { ClassSchema } from '@/lib/validation';
import type { ClassRow } from '@/types/database';

export async function createClassAction(
  input: unknown,
): Promise<ActionResult<ClassRow>> {
  const parsed = ClassSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('classes')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/classes');
  revalidatePath('/attendance');
  revalidatePath('/reports');
  return ok(data);
}

export async function updateClassAction(
  id: string,
  input: unknown,
): Promise<ActionResult<ClassRow>> {
  const parsed = ClassSchema.partial().safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('classes')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/classes');
  return ok(data);
}

export async function deleteClassAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/admin/classes');
  return ok(null);
}
