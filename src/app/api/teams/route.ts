import { NextResponse } from 'next/server';
import { createServerSideClient } from '@/infrastructure/database/supabase.server';

export async function GET() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('album_id', '00000000-0000-0000-0000-000000000001')
    .order('group_stage')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ teams: teams || [] });
}
