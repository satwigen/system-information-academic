import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeFilename } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 52_428_800; // 50 MB

/**
 * Accepts a multipart upload, stores the file in Supabase Storage at
 * materials/{class_id}/{session_date}/{uuid}-{safe-filename}, and returns
 * metadata. The caller then invokes finalizeMaterialAction to insert the DB row.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  // Authorization: DOSEN or ADMIN only.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['DOSEN', 'ADMIN'].includes(profile.role)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const file = form.get('file');
  const classId = String(form.get('class_id') ?? '');
  const sessionDate = String(form.get('session_date') ?? '');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'Empty file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `File exceeds 50 MB (got ${(file.size / 1_048_576).toFixed(1)} MB)` },
      { status: 413 },
    );
  }
  if (!classId || !sessionDate) {
    return NextResponse.json({ ok: false, error: 'Missing class_id or session_date' }, { status: 400 });
  }

  const safeName = sanitizeFilename(file.name);
  const unique = crypto.randomUUID();
  const filePath = `${classId}/${sessionDate}/${unique}-${safeName}`;

  const { error } = await supabase.storage
    .from('materials')
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    console.error('[materials/upload]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      filePath,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
    },
  });
}
