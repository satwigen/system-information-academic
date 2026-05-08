import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  // Don't show the login page to users who already have a session.
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/');

  return <LoginForm next={searchParams.next ?? '/'} errorFromQuery={searchParams.error} />;
}
