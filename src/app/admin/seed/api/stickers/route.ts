import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

export async function GET() {
  const supabase = await createServerSideClient();

  const { data: stickers, error } = await supabase
    .from('stickers')
    .select('*, team:teams(name, code), category:categories(name, code)')
    .order('code');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ stickers: stickers || [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSideClient();
  const body = await request.json();

  const { code, team_id, category_id, player_nombre, player_apellido, player_fecha_nacimiento, player_estatura, player_peso, player_club_actual, player_pais_club } = body;

  if (!code || !team_id || !category_id) {
    return NextResponse.json({ error: 'code, team_id, and category_id are required' }, { status: 400 });
  }

  const albumId = '00000000-0000-0000-0000-000000000001';

  const { data, error } = await supabase
    .from('stickers')
    .insert({
      album_id: albumId,
      code: code.toUpperCase(),
      team_id,
      category_id,
      player_nombre: player_nombre || null,
      player_apellido: player_apellido || null,
      player_fecha_nacimiento: player_fecha_nacimiento || null,
      player_estatura: player_estatura ? parseFloat(player_estatura) : null,
      player_peso: player_peso ? parseFloat(player_peso) : null,
      player_club_actual: player_club_actual || null,
      player_pais_club: player_pais_club || null,
      number: 0,
      sticker_type_id: '00000000-0000-0000-0000-000000000001',
      rarity: 'common',
      image_url: `/api/placeholder/sticker/${code}`,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe una lámina con ese código' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createServerSideClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await supabase.from('stickers').delete().eq('id', id);
  return NextResponse.json({ success: true });
}
