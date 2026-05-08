'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { DepartmentSchema } from '@/lib/validation';
import type { DepartmentRow } from '@/types/database';

export async function createDepartmentAction(
  input: unknown,
): Promise<ActionResult<DepartmentRow>> {
  const parsed = DepartmentSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('departments')
    .insert(parsed.data)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/departments');
  revalidatePath('/');
  return ok(data);
}

export async function updateDepartmentAction(
  id: string,
  input: unknown,
): Promise<ActionResult<DepartmentRow>> {
  const parsed = DepartmentSchema.partial().safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('departments')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/departments');
  revalidatePath('/');
  return ok(data);
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/admin/departments');
  revalidatePath('/');
  return ok(null);
}
