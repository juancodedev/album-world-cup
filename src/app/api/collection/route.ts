import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';
import { SupabaseUserCollectionRepository } from '../../../infrastructure/repositories/supabase-user-collection.repository';
import { SupabaseStickerRepository } from '../../../infrastructure/repositories/supabase-sticker.repository';
import { SupabaseStickerDuplicateRepository } from '../../../infrastructure/repositories/supabase-sticker-duplicate.repository';
import { AddStickerUseCase } from '../../../application/use-cases/collection/add-sticker.use-case';
import { CollectionMapper } from '../../../application/mappers/collection.mapper';

export async function POST(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stickerId, albumId } = body;

    if (!stickerId || !albumId) {
      return NextResponse.json(
        { error: 'stickerId and albumId are required' },
        { status: 400 },
      );
    }

    const userCollectionRepo = new SupabaseUserCollectionRepository(supabase);
    const stickerRepo = new SupabaseStickerRepository(supabase);
    const mapper = new CollectionMapper();

    const useCase = new AddStickerUseCase(userCollectionRepo, stickerRepo, mapper);
    const result = await useCase.execute({
      userId: session.user.id,
      stickerId,
      albumId,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const albumId = searchParams.get('albumId');

  if (!albumId) {
    return NextResponse.json({ error: 'albumId is required' }, { status: 400 });
  }

  try {
    const repo = new SupabaseUserCollectionRepository(supabase);
    const stickers = await repo.findByUserAndAlbum(session.user.id, albumId);

    return NextResponse.json({ data: stickers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 },
    );
  }
}
