import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../infrastructure/database/supabase.config';

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName } = body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json({ error: 'fullName is required' }, { status: 400 });
    }

    const trimmed = fullName.trim();

    const { error } = await supabase
      .from(SUPABASE_TABLES.users)
      .update({ full_name: trimmed })
      .eq('id', authUser.id);

    if (error) throw error;

    return NextResponse.json({ data: { fullName: trimmed } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
