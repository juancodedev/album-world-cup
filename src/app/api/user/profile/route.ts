import { NextResponse } from 'next/server';
import { createServerSideClient, createServiceRoleClient } from '../../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../../infrastructure/database/supabase.config';

export async function GET() {
  const supabase = await createServerSideClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ user: null });
  }

  const { data } = await admin
    .from(SUPABASE_TABLES.users)
    .select('full_name, avatar_url')
    .eq('auth_uid', authUser.id)
    .maybeSingle();

  return NextResponse.json({
    user: {
      fullName: data?.full_name || authUser.user_metadata?.full_name || null,
      avatarUrl: data?.avatar_url || authUser.user_metadata?.avatar_url || null,
    },
  });
}
