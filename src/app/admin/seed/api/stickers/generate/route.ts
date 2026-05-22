import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

export async function POST(request: Request) {
  const supabase = await createServerSideClient();
  const { team_id } = await request.json();

  if (!team_id) {
    return NextResponse.json({ error: 'team_id is required' }, { status: 400 });
  }

  const albumId = '00000000-0000-0000-0000-000000000001';

  const [teamData, typeData, maxSticker, players] = await Promise.all([
    supabase.from('teams').select('*').eq('id', team_id).single(),
    supabase.from('sticker_types').select('id, code'),
    supabase.from('stickers').select('number').eq('album_id', albumId).order('number', { ascending: false }).limit(1).single(),
    supabase.from('players').select('*').eq('team_id', team_id).order('jersey_number'),
  ]);

  if (!teamData.data) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  const types = (typeData.data || []) as { id: string; code: string }[];
  let nextNumber = (maxSticker.data?.number || 0) + 1;
  const teamTypeId = types.find(t => t.code === 'team')?.id;
  const playerTypeId = types.find(t => t.code === 'player')?.id;

  if (!teamTypeId || !playerTypeId) {
    return NextResponse.json({ error: 'Required sticker types not found' }, { status: 400 });
  }

  const stickersToInsert = [];

  const playerList = players.data as { id: string }[] | null;
  if (playerList && playerList.length > 0) {
    for (const player of playerList) {
      stickersToInsert.push({
        album_id: albumId,
        number: nextNumber++,
        player_id: player.id,
        team_id,
        sticker_type_id: playerTypeId,
        rarity: 'common',
        image_url: `/api/placeholder/sticker/${nextNumber - 1}`,
        is_special: false,
      });
    }
  }

  const { error } = await supabase.from('stickers').insert(stickersToInsert);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    count: stickersToInsert.length,
    from_number: nextNumber - stickersToInsert.length,
    to_number: nextNumber - 1,
  });
}
