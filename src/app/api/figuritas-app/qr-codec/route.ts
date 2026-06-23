import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '../../../../infrastructure/database/supabase.server';
import { isFiguritasAppEnabled, QR_CODEC_MAX_STICKERS } from '../../../../config/figuritas-app';
import { QRCodecService } from '../../../../domain/services/qr-codec.service';

const ALBUM_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isFiguritasAppEnabled()) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 404 });
  }

  try {
    // Get the user's default account
    const { data: account } = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', authUser.id)
      .limit(1)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: 'No account found' }, { status: 400 });
    }

    const accountId = account.account_id;

    // Fetch all stickers in the album (IDs 1-984)
    const { data: stickers } = await supabase
      .from('stickers')
      .select('id, number')
      .eq('album_id', ALBUM_ID)
      .gte('number', 1)
      .lte('number', QR_CODEC_MAX_STICKERS);

    if (!stickers) {
      return NextResponse.json({ error: 'Failed to fetch stickers' }, { status: 500 });
    }

    // Build a map: sticker UUID → number (1-984)
    const stickerNumberMap = new Map<string, number>();
    for (const s of stickers) {
      stickerNumberMap.set(s.id, s.number);
    }

    // Fetch user's owned stickers
    const { data: ownedStickers } = await supabase
      .from('user_stickers')
      .select('sticker_id')
      .eq('user_id', authUser.id)
      .eq('account_id', accountId);

    const ownedSet = new Set((ownedStickers ?? []).map((os: { sticker_id: string }) => os.sticker_id));

    // Fetch user's duplicates
    const { data: duplicates } = await supabase
      .from('sticker_duplicates')
      .select('sticker_id, quantity')
      .eq('user_id', authUser.id)
      .eq('account_id', accountId);

    // Compute available (numbers from duplicates) and wanted (numbers NOT owned)
    const available: number[] = [];
    const wanted: number[] = [];

    for (const [stickerId, number] of stickerNumberMap) {
      const isOwned = ownedSet.has(stickerId);
      const hasDuplicate = (duplicates ?? []).some(
        (d: { sticker_id: string; quantity: number }) => d.sticker_id === stickerId && d.quantity > 0,
      );

      if (hasDuplicate) {
        available.push(number);
      }
      if (!isOwned) {
        wanted.push(number);
      }
    }

    const service = new QRCodecService();
    const qrString = service.encodeV2(available, wanted);

    return NextResponse.json({ qrString });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 },
    );
  }
}
