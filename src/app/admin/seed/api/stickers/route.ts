import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

const ADMIN_EMAIL = 'cl.jmunoz@gmail.com';

async function getClient() {
  const supabase = await createServerSideClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return supabase;
}

export async function GET() {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: stickers, error } = await supabase
    .from('stickers')
    .select('*, team:teams(name, code), category:categories(name, code)')
    .order('code');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ stickers: stickers || [] });
}

export async function POST(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();

  const { code, team_id, category_id, image_url, player_nombre, player_apellido, player_fecha_nacimiento, player_estatura, player_peso, player_club_actual, player_pais_club } = body;

  if (!code || !team_id || !category_id) {
    return NextResponse.json({ error: 'code, team_id, and category_id are required' }, { status: 400 });
  }

  const albumId = '00000000-0000-0000-0000-000000000001';

  const { data: maxData } = await supabase
    .from('stickers')
    .select('number')
    .eq('album_id', albumId)
    .order('number', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = (maxData?.number || 0) + 1;

  const { data, error } = await supabase
    .from('stickers')
    .insert({
      album_id: albumId,
      code: code.toUpperCase(),
      number: nextNumber,
      team_id,
      category_id,
      image_url: image_url || `/api/placeholder/sticker/${code}`,
      player_nombre: player_nombre || null,
      player_apellido: player_apellido || null,
      player_fecha_nacimiento: player_fecha_nacimiento || null,
      player_estatura: player_estatura ? parseFloat(player_estatura) : null,
      player_peso: player_peso ? parseFloat(player_peso) : null,
      player_club_actual: player_club_actual || null,
      player_pais_club: player_pais_club || null,
      rarity: 'common',
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

export async function PATCH(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { id, image_url, player_nombre, player_apellido, player_fecha_nacimiento, player_estatura, player_peso, player_club_actual, player_pais_club } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (image_url !== undefined) updates.image_url = image_url;
  if (player_nombre !== undefined) updates.player_nombre = player_nombre || null;
  if (player_apellido !== undefined) updates.player_apellido = player_apellido || null;
  if (player_fecha_nacimiento !== undefined) updates.player_fecha_nacimiento = player_fecha_nacimiento || null;
  if (player_estatura !== undefined) updates.player_estatura = player_estatura ? parseFloat(player_estatura) : null;
  if (player_peso !== undefined) updates.player_peso = player_peso ? parseFloat(player_peso) : null;
  if (player_club_actual !== undefined) updates.player_club_actual = player_club_actual || null;
  if (player_pais_club !== undefined) updates.player_pais_club = player_pais_club || null;

  const { error } = await supabase.from('stickers').update(updates).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await supabase.from('stickers').delete().eq('id', id);
  return NextResponse.json({ success: true });
}
