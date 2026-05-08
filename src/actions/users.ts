'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import {
  CreateUserSchema,
  UpdateUserSchema,
  ResetUserPasswordSchema,
} from '@/lib/validation';
import type { ProfileRow } from '@/types/database';

async function assertAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'ADMIN') return { ok: false, error: 'Forbidden' };
  return { ok: true };
}

export async function createUserAction(
  input: unknown,
): Promise<ActionResult<ProfileRow>> {
  const gate = await assertAdmin();
  if (!gate.ok) return fail(gate.error);

  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }
  const v = parsed.data;

  const admin = createAdminClient();

  // Create the auth user. The handle_new_auth_user trigger auto-inserts the
  // profiles row; we then PATCH it with the full details.
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: v.email,
    password: v.password,
    email_confirm: true,
    user_metadata: { full_name: v.full_name, role: v.role },
  });

  if (authErr || !created.user) return fail(authErr?.message ?? 'Create user failed');

  const supabase = createClient();
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .update({
      role: v.role,
      full_name: v.full_name,
      email: v.email,
      department_id: v.department_id ?? null,
      class_id: v.class_id ?? null,
      nim: v.nim ?? null,
      nip: v.nip ?? null,
      phone: v.phone ?? null,
      address: v.address ?? null,
    })
    .eq('id', created.user.id)
    .select('*')
    .single();

  if (profErr || !profile) {
    // Roll back the auth user to avoid orphan.
    await admin.auth.admin.deleteUser(created.user.id);
    return fail(mapDbError(profErr));
  }

  revalidatePath('/admin/users');
  revalidatePath('/search');
  return ok(profile);
}

export async function updateUserAction(
  id: string,
  input: unknown,
): Promise<ActionResult<ProfileRow>> {
  const gate = await assertAdmin();
  if (!gate.ok) return fail(gate.error);

  const parsed = UpdateUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/admin/users');
  revalidatePath('/search');
  return ok(data);
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return fail(gate.error);

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return fail(error.message);

  revalidatePath('/admin/users');
  revalidatePath('/search');
  return ok(null);
}

export async function resetUserPasswordAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return fail(gate.error);

  const parsed = ResetUserPasswordSchema.safeParse(input);
  if (!parsed.success) return fail('Password must be at least 8 characters');

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: parsed.data.newPassword,
  });
  if (error) return fail(error.message);
  return ok(null);
}
