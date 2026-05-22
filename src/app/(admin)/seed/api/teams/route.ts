import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

export async function GET() {
  const supabase = await createServerSideClient();

  const [teams, confederations] = await Promise.all([
    supabase.from('teams').select('*, confederation:confederations(name, color)').order('name'),
    supabase.from('confederations').select('*').order('name'),
  ]);

  return NextResponse.json({
    teams: teams.data || [],
    confederations: confederations.data || [],
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSideClient();
  const body = await request.json();

  const { name, code, confederation_id, group_stage } = body;

  if (!name || !code || !confederation_id) {
    return NextResponse.json({ error: 'name, code, and confederation_id are required' }, { status: 400 });
  }

  const albumId = '00000000-0000-0000-0000-000000000001';

  const { data, error } = await supabase
    .from('teams')
    .insert({
      album_id: albumId,
      name,
      code: code.toUpperCase(),
      confederation_id,
      group_stage: group_stage || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un equipo con ese código en este álbum' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
