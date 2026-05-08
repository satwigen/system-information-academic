'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { ProfileUpdateSchema, SetAvatarSchema } from '@/lib/validation';
import type { ProfileRow } from '@/types/database';

async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult<ProfileRow>> {
  const parsed = ProfileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const userId = await getCurrentUserId();
  if (!userId) return fail('Not authenticated');

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/profile');
  revalidatePath('/', 'layout'); // refresh sidebar name
  return ok(data);
}

export async function setAvatarAction(
  input: unknown,
): Promise<ActionResult<ProfileRow>> {
  const parsed = SetAvatarSchema.safeParse(input);
  if (!parsed.success) return fail('Invalid path');

  const userId = await getCurrentUserId();
  if (!userId) return fail('Not authenticated');

  const supabase = createClient();
  // Translate the storage path to a full public URL.
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(parsed.data.path);

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: pub.publicUrl })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/profile');
  revalidatePath('/', 'layout');
  return ok(data);
}
