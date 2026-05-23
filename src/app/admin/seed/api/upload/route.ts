import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

async function getClient() {
  const supabase = await createServerSideClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return supabase;
}

export async function POST(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const code = formData.get('code') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó un archivo' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = code
    ? `${code.toLowerCase().replace(/\s+/g, '-')}.${ext}`
    : `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('stickers')
    .upload(fileName, file, { upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from('stickers')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
