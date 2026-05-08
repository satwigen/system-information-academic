'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import {
  CreateAnnouncementSchema,
  UpdateAnnouncementSchema,
  AddCommentSchema,
} from '@/lib/validation';
import type { AnnouncementRow, CommentRow } from '@/types/database';

export async function createAnnouncementAction(
  input: unknown,
): Promise<ActionResult<AnnouncementRow>> {
  const parsed = CreateAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data, error } = await supabase
    .from('announcements')
    .insert({ ...parsed.data, author_id: user.id })
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/feed');
  revalidatePath('/');
  return ok(data);
}

/**
 * PRD: ADM-FEED-01 — admin can edit ANY post.
 * RLS lets admin OR author through, so we do no extra ownership check here.
 */
export async function updateAnnouncementAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AnnouncementRow>> {
  const parsed = UpdateAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('announcements')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/feed');
  return ok(data);
}

/** PRD: ADM-FEED-02 — admin can delete ANY post. */
export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/feed');
  revalidatePath('/');
  return ok(null);
}

export async function toggleLikeAction(
  announcementId: string,
): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('announcement_id', announcementId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('id', existing.id);
    if (error) return fail(mapDbError(error));
    revalidatePath('/feed');
    return ok({ liked: false });
  }

  const { error } = await supabase
    .from('likes')
    .insert({ announcement_id: announcementId, user_id: user.id });
  if (error) return fail(mapDbError(error));
  revalidatePath('/feed');
  return ok({ liked: true });
}

export async function addCommentAction(
  input: unknown,
): Promise<ActionResult<CommentRow>> {
  const parsed = AddCommentSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      announcement_id: parsed.data.announcement_id,
      user_id: user.id,
      body: parsed.data.body,
    })
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/feed');
  return ok(data);
}

export async function deleteCommentAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/feed');
  return ok(null);
}
