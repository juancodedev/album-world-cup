import { SupabaseClient } from '@supabase/supabase-js';
import { IShareCollectionRepository } from '../../domain/repositories/share-collection.repository';
import { ShareCollection } from '../../domain/entities/share-collection.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseShareCollectionRepository implements IShareCollectionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getByCode(code: string): Promise<ShareCollection | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.sharedCollections)
      .select('*')
      .eq('share_code', code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getByAccount(accountId: string): Promise<ShareCollection | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.sharedCollections)
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async save(entity: ShareCollection): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.sharedCollections)
      .insert(this.toPersistence(entity));

    if (error) throw error;
  }

  async update(entity: ShareCollection): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.sharedCollections)
      .update(this.toPersistence(entity))
      .eq('id', entity.id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.sharedCollections)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): ShareCollection {
    return new ShareCollection({
      id: raw.id as string,
      accountId: raw.account_id as string,
      userId: raw.user_id as string,
      shareCode: raw.share_code as string,
      isPublic: raw.is_public as boolean,
      showDuplicates: (raw.show_duplicates as boolean) ?? true,
      showMissing: (raw.show_missing as boolean) ?? true,
      expiresAt: raw.expires_at ? new Date(raw.expires_at as string) : undefined,
      viewCount: raw.view_count as number,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(entity: ShareCollection): Record<string, unknown> {
    return {
      id: entity.id,
      account_id: entity.accountId,
      user_id: entity.userId,
      share_code: entity.shareCode,
      is_public: entity.isPublic,
      show_duplicates: entity.showDuplicates,
      show_missing: entity.showMissing,
      expires_at: entity.expiresAt?.toISOString(),
      view_count: entity.viewCount,
    };
  }
}
