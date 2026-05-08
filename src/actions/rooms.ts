'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { RoomSchema, RoomMappingSchema } from '@/lib/validation';
import type { RoomRow, RoomMappingRow } from '@/types/database';

// ---------------- Rooms ----------------

export async function createRoomAction(
  input: unknown,
): Promise<ActionResult<RoomRow>> {
  const parsed = RoomSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rooms')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/rooms');
  revalidateTag('room-mappings');
  return ok(data);
}

export async function updateRoomAction(
  id: string,
  input: unknown,
): Promise<ActionResult<RoomRow>> {
  const parsed = RoomSchema.partial().safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rooms')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/rooms');
  revalidateTag('room-mappings');
  return ok(data);
}

export async function deleteRoomAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/admin/rooms');
  revalidateTag('room-mappings');
  return ok(null);
}

// ---------------- Room mappings ----------------

export async function createRoomMappingAction(
  input: unknown,
): Promise<ActionResult<RoomMappingRow>> {
  const parsed = RoomMappingSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('room_mappings')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/rooms');
  revalidatePath('/');
  revalidateTag('room-mappings');
  return ok(data);
}

export async function updateRoomMappingAction(
  id: string,
  input: unknown,
): Promise<ActionResult<RoomMappingRow>> {
  const parsed = RoomMappingSchema.partial().safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('room_mappings')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/rooms');
  revalidateTag('room-mappings');
  return ok(data);
}

export async function deleteRoomMappingAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('room_mappings').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/admin/rooms');
  revalidatePath('/');
  revalidateTag('room-mappings');
  return ok(null);
}
