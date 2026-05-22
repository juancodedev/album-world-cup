import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

export async function POST(request: Request) {
  const supabase = await createServerSideClient();
  const body = await request.json();

  const { team_id, name, position, jersey_number } = body;

  if (!team_id || !name || !position) {
    return NextResponse.json({ error: 'team_id, name, and position are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('players')
    .insert({ team_id, name, position, jersey_number: jersey_number || null })
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

  await supabase.from('players').delete().eq('id', id);
  return NextResponse.json({ success: true });
}
