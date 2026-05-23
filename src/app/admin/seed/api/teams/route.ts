import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

async function getClient() {
  const supabase = await createServerSideClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return supabase;
}

export async function GET() {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ teams: teams || [] });
}

export async function POST(request: Request) {
  const supabase = await getClient();
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();

  const { name, code } = body;

  if (!name || !code) {
    return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
  }

  const albumId = '00000000-0000-0000-0000-000000000001';

  const { data, error } = await supabase
    .from('teams')
    .insert({
      album_id: albumId,
      name,
      code: code.toUpperCase(),
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
