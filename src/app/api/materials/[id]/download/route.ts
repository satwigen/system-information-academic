import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Issues a short-lived signed URL (60s) for a material and redirects to it.
 * RLS on public.materials ensures only allowed rows come back, so we don't
 * need to re-check permissions here.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', _req.url));

  const { data: material, error } = await supabase
    .from('materials')
    .select('file_path, title')
    .eq('id', params.id)
    .single();

  if (error || !material) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from('materials')
    .createSignedUrl(material.file_path, 60, { download: material.title });

  if (signErr || !signed) {
    console.error('[materials/download]', signErr);
    return new NextResponse('Error generating download link', { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
