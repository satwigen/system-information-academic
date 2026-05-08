'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, type ActionResult } from '@/lib/action-result';
import {
  SignInSchema,
  PasswordResetRequestSchema,
  UpdatePasswordSchema,
} from '@/lib/validation';

export async function signInAction(formData: FormData): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return fail(error.message);

  const next = (formData.get('next') as string) || '/';
  return ok({ redirectTo: next });
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = PasswordResetRequestSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return fail('Invalid email');

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset`,
  });
  if (error) return fail(error.message);
  return ok(null);
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = UpdatePasswordSchema.safeParse({ newPassword: formData.get('newPassword') });
  if (!parsed.success) return fail('Password must be at least 8 characters');

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return fail(error.message);
  return ok(null);
}
