import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';
import { albumMapper } from '@/application/mappers/album.mapper';
import { CreateAlbumSchema, UpdateAlbumSchema } from '@/application/validators/album.validators';

async function getClient() {
  const supabase = await createServerSideClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return supabase;
}

export async function GET() {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .order('year', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ albums: albums || [] });
}

export async function POST(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const parsed = CreateAlbumSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const album = albumMapper.toDomain(parsed.data);
  const { error } = await supabase.from('albums').insert(albumMapper.toPersistence(album));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(albumMapper.toDTO(album));
}

export async function PUT(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const parsed = UpdateAlbumSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.year !== undefined) updates.year = parsed.data.year;
  if (parsed.data.tournamentType !== undefined) updates.tournament_type = parsed.data.tournamentType;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.imageUrl !== undefined) updates.image_url = parsed.data.imageUrl;
  if (parsed.data.totalStickers !== undefined) updates.total_stickers = parsed.data.totalStickers;
  if (parsed.data.specialStickers !== undefined) updates.special_stickers = parsed.data.specialStickers;

  const { error } = await supabase.from('albums').update(updates).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('albums').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
