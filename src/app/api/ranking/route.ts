import { NextResponse } from 'next/server';
import { createServerSideClient, createServiceRoleClient } from '../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../infrastructure/database/supabase.config';

export const dynamic = 'force-dynamic';

const TOTAL_STICKERS = 1005;

export async function GET() {
  try {
    const supabase = await createServerSideClient();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || null;

    const admin = createServiceRoleClient();
    const client = admin || supabase;

    const { data: stickerRows } = await client
      .from(SUPABASE_TABLES.userStickers)
      .select('user_id, sticker_id');

    const countMap = new Map<string, Set<string>>();
    for (const row of stickerRows || []) {
      if (!countMap.has(row.user_id)) {
        countMap.set(row.user_id, new Set());
      }
      countMap.get(row.user_id)!.add(row.sticker_id);
    }

    const userInfo = new Map<string, { name: string; avatar: string }>();

    if (admin) {
      const { data: publicUsers } = await admin
        .from(SUPABASE_TABLES.users)
        .select('id, email, full_name, avatar_url');

      for (const u of publicUsers || []) {
        userInfo.set(u.id, {
          name: u.full_name || u.email?.split('@')[0] || 'Usuario',
          avatar: u.avatar_url || '⚽',
        });
      }
    }

    const allUserIds = new Set<string>();

    for (const id of userInfo.keys()) {
      allUserIds.add(id);
    }

    for (const id of countMap.keys()) {
      allUserIds.add(id);
    }

    const ranking = Array.from(allUserIds).map(id => {
      const info = userInfo.get(id);
      const owned = countMap.get(id)?.size || 0;

      return {
        userId: id,
        name: info?.name || 'Usuario',
        avatar: info?.avatar || '⚽',
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
