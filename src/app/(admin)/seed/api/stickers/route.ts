import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

export async function GET() {
  const supabase = await createServerSideClient();

  const [stickers, types] = await Promise.all([
    supabase.from('stickers').select('*, team:teams(name, code), player:players(name, position)').order('number'),
    supabase.from('sticker_types').select('*'),
  ]);

  return NextResponse.json({
    stickers: stickers.data || [],
    types: types.data || [],
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSideClient();
  const body = await request.json();

  const { team_id, player_id, type_code, rarity, is_special, special_attribute } = body;

  if (!team_id || !type_code) {
    return NextResponse.json({ error: 'team_id and type_code are required' }, { status: 400 });
  }

  const albumId = '00000000-0000-0000-0000-000000000001';

  const { data: typeData } = await supabase
    .from('sticker_types')
    .select('id')
    .eq('code', type_code)
    .single();

  if (!typeData) {
    return NextResponse.json({ error: `Sticker type '${type_code}' not found` }, { status: 400 });
  }

  const { data: maxSticker } = await supabase
    .from('stickers')
    .select('number')
    .eq('album_id', albumId)
    .order('number', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = (maxSticker?.number || 0) + 1;

  const { data, error } = await supabase
    .from('stickers')
    .insert({
      album_id: albumId,
      number: nextNumber,
      player_id: player_id || null,
      team_id,
      sticker_type_id: typeData.id,
      rarity: rarity || 'common',
      image_url: `/api/placeholder/sticker/${nextNumber}`,
      is_special: is_special || false,
      special_attribute: special_attribute || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
