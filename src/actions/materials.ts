'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { FinalizeMaterialSchema, UpdateMaterialSchema } from '@/lib/validation';
import type { MaterialRow } from '@/types/database';

/**
 * Finalize step after /api/materials/upload returns a storage path.
 * Inserts the materials row owned by the uploading dosen (or admin).
 */
export async function finalizeMaterialAction(
  input: unknown,
): Promise<ActionResult<MaterialRow>> {
  const parsed = FinalizeMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data, error } = await supabase
    .from('materials')
    .insert({ ...parsed.data, uploaded_by_id: user.id })
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/materials');
  return ok(data);
}

export async function updateMaterialAction(
  id: string,
  input: unknown,
): Promise<ActionResult<MaterialRow>> {
  const parsed = UpdateMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('materials')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/materials');
  return ok(data);
}

export async function deleteMaterialAction(id: string): Promise<ActionResult> {
  const supabase = createClient();

  // Fetch the row first so we know which object to remove from storage.
  const { data: row } = await supabase
    .from('materials')
    .select('file_path')
    .eq('id', id)
    .single();

  const { error: delErr } = await supabase.from('materials').delete().eq('id', id);
  if (delErr) return fail(mapDbError(delErr));

  if (row?.file_path) {
    await supabase.storage.from('materials').remove([row.file_path]);
  }

  revalidatePath('/materials');
  return ok(null);
}
