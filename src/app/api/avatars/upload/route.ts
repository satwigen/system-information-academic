import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/** Uploads avatar to avatars/{userId}/avatar.{ext} and returns publicUrl + path. */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'File must be 1 B – 5 MB' },
      { status: 413 },
    );
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ ok: false, error: 'Only image files allowed' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${user.id}/avatar-${Date.now()}.${ext || 'jpg'}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    console.error('[avatars/upload]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  return NextResponse.json({ ok: true, data: { publicUrl: pub.publicUrl, path } });
}
