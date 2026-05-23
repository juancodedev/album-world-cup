import { NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../infrastructure/database/supabase.config';

const TOTAL_STICKERS = 1005;

export async function GET() {
  try {
    const supabase = await createServerSideClient();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || null;

    const { data: users } = await supabase
      .from(SUPABASE_TABLES.users)
      .select('id, full_name, avatar_url');

    const { data: stickerRows } = await supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('user_id, sticker_id');

    const countMap = new Map<string, Set<string>>();
    for (const row of stickerRows || []) {
      if (!countMap.has(row.user_id)) {
        countMap.set(row.user_id, new Set());
      }
      countMap.get(row.user_id)!.add(row.sticker_id);
    }

    const ranking = (users || []).map(u => {
      const owned = countMap.get(u.id)?.size || 0;
      return {
        userId: u.id,
        name: u.full_name || 'Usuario',
        avatar: u.avatar_url || '⚽',
        owned,
        total: TOTAL_STICKERS,
        percentage: Math.round((owned / TOTAL_STICKERS) * 100),
      };
    });

    ranking.sort((a, b) => b.owned - a.owned);

    return NextResponse.json({ data: ranking, currentUserId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ranking' },
      { status: 500 },
    );
  }
}
