import { NextResponse } from 'next/server';
import { createServerSideClient, createServiceRoleClient } from '../../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../../infrastructure/database/supabase.config';

export async function GET() {
  const supabase = await createServerSideClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ user: null });
  }

  const { data } = await admin
    .from(SUPABASE_TABLES.users)
    .select('full_name, avatar_url')
    .eq('auth_uid', session.user.id)
    .maybeSingle();

  return NextResponse.json({
    user: {
      fullName: data?.full_name || session.user.user_metadata?.full_name || null,
      avatarUrl: data?.avatar_url || session.user.user_metadata?.avatar_url || null,
    },
  });
}
