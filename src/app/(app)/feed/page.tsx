import { requireSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import FeedClient from './FeedClient';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const { profile } = await requireSession();
  const supabase = createClient();

  const [{ data: announcements }, { data: comments }, { data: likes }, { data: authors }] = await Promise.all([
    supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('comments').select('*').order('created_at', { ascending: true }),
    supabase.from('likes').select('*'),
    supabase.from('profiles').select('id, full_name, role, avatar_url'),
  ]);

  const canPost = ['ADMIN', 'HEAD', 'DOSEN'].includes(profile.role);
  const isAdmin = profile.role === 'ADMIN';

  return (
    <div>
      <Header title="Feed" description="Announcements and campus-wide updates." />
      <FeedClient
        announcements={announcements ?? []}
        comments={comments ?? []}
        likes={likes ?? []}
        authors={authors ?? []}
        currentUserId={profile.id}
        canPost={canPost}
        isAdmin={isAdmin}
      />
    </div>
  );
}
