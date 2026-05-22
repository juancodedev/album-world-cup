import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';
import { SupabaseShareCollectionRepository } from '../../../infrastructure/repositories/supabase-share-collection.repository';
import { GenerateShareCodeUseCase } from '../../../application/use-cases/share/generate-share-code.use-case';
import { shareCollectionMapper } from '../../../application/mappers/share-collection.mapper';

export async function POST(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const repo = new SupabaseShareCollectionRepository(supabase);
    const useCase = new GenerateShareCodeUseCase(repo);
    const result = await useCase.execute(session.user.id);

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }

  const supabase = await createServerSideClient();

  try {
    const repo = new SupabaseShareCollectionRepository(supabase);
    const share = await repo.getByCode(code);

    if (!share) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: shareCollectionMapper.toDTO(share),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shared collection' },
      { status: 500 },
    );
  }
}
