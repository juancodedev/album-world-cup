import { NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../infrastructure/database/supabase.config';

const TOTAL_STICKERS = 1005;

export async function GET() {
  const supabase = await createServerSideClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const { data: userMembership } = await supabase
      .from(SUPABASE_TABLES.accountMembers)
      .select('account_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!userMembership?.account_id) {
      return NextResponse.json({ data: [] });
    }

    const accountId = userMembership.account_id;

    const { data: accountMembers } = await supabase
      .from(SUPABASE_TABLES.accountMembers)
      .select('user_id')
      .eq('account_id', accountId);

    if (!accountMembers || accountMembers.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const userIds = accountMembers.map(m => m.user_id);

    const { data: users } = await supabase
      .from(SUPABASE_TABLES.users)
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const userMap = new Map((users || []).map(u => [u.id, u]));

    const { data: stickerRows } = await supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('user_id, sticker_id')
      .in('user_id', userIds);

    const countMap = new Map<string, Set<string>>();
    for (const row of stickerRows || []) {
      if (!countMap.has(row.user_id)) {
        countMap.set(row.user_id, new Set());
      }
      countMap.get(row.user_id)!.add(row.sticker_id);
    }

    const ranking = userIds.map(uid => {
      const user = userMap.get(uid);
      const owned = countMap.get(uid)?.size || 0;
      const pct = Math.round((owned / TOTAL_STICKERS) * 100);
      return {
        userId: uid,
        name: user?.full_name || 'Usuario',
        avatar: user?.avatar_url || '⚽',
        owned,
        total: TOTAL_STICKERS,
        percentage: pct,
      };
    });

    ranking.sort((a, b) => b.owned - a.owned);

    return NextResponse.json({ data: ranking });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ranking' },
      { status: 500 },
    );
  }
}
