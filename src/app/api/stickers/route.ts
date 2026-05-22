import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';
import { SupabaseStickerRepository } from '../../../infrastructure/repositories/supabase-sticker.repository';
import { stickerMapper } from '../../../application/mappers/sticker.mapper';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const albumId = searchParams.get('albumId');
  const rarity = searchParams.get('rarity');
  const teamId = searchParams.get('teamId');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!albumId) {
    return NextResponse.json({ error: 'albumId is required' }, { status: 400 });
  }

  const supabase = await createServerSideClient();
  const repository = new SupabaseStickerRepository(supabase);

  try {
    const stickers = await repository.getAll({
      albumId,
      rarity: rarity || undefined,
      teamId: teamId || undefined,
      search: search || undefined,
    });

    const dtos = stickers.slice(offset, offset + limit).map(s => stickerMapper.toDTO(s));

    return NextResponse.json({
      data: dtos,
      total: stickers.length,
      offset,
      limit,
      nextOffset: offset + limit < stickers.length ? offset + limit : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stickers' },
      { status: 500 },
    );
  }
}
