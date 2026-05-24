import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient, createServiceRoleClient } from '../../../infrastructure/database/supabase.server';
import { SupabaseShareCollectionRepository } from '../../../infrastructure/repositories/supabase-share-collection.repository';
import { SupabaseUserCollectionRepository } from '../../../infrastructure/repositories/supabase-user-collection.repository';
import { SupabaseStickerRepository } from '../../../infrastructure/repositories/supabase-sticker.repository';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/supabase-user.repository';
import { SupabaseTeamRepository } from '../../../infrastructure/repositories/supabase-team.repository';
import { GenerateShareCodeUseCase } from '../../../application/use-cases/share/generate-share-code.use-case';
import { GetSharedCollectionUseCase } from '../../../application/use-cases/share/get-shared-collection.use-case';

export async function POST(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    const repo = new SupabaseShareCollectionRepository(supabase);
    const useCase = new GenerateShareCodeUseCase(repo);
    const result = await useCase.execute(accountId, authUser.id);

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

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const useCase = new GetSharedCollectionUseCase(
      new SupabaseShareCollectionRepository(supabase),
      new SupabaseUserCollectionRepository(supabase),
      new SupabaseStickerRepository(supabase),
      new SupabaseUserRepository(supabase),
      new SupabaseTeamRepository(supabase),
    );

    const result = await useCase.execute(code);

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shared collection' },
      { status: 500 },
    );
  }
}
