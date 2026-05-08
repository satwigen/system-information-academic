import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ProfileRow, UserRole } from '@/types/database';

export interface SessionContext {
  userId: string;
  email: string;
  profile: ProfileRow;
}

/** Fetch the current session's profile or redirect to /login. */
export async function requireSession(): Promise<SessionContext> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) redirect('/login?error=profile_missing');
  return { userId: user.id, email: user.email ?? profile.email, profile };
}

/** Fetch the session or null (no redirect). */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (!profile) return null;
  return { userId: user.id, email: user.email ?? profile.email, profile };
}

/** Assert the user has one of the allowed roles; otherwise redirect home. */
export async function requireRole(
  allowed: UserRole | UserRole[],
): Promise<SessionContext> {
  const ctx = await requireSession();
  const allow = Array.isArray(allowed) ? allowed : [allowed];
  if (!allow.includes(ctx.profile.role)) redirect('/');
  return ctx;
}
