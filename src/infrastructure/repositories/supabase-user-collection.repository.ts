import { SupabaseClient } from '@supabase/supabase-js';
import { IUserCollectionRepository } from '../../domain/repositories/user-collection.repository';
import { UserCollection } from '../../domain/entities/user-collection.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseUserCollectionRepository implements IUserCollectionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getByUserAndSticker(accountId: string, userId: string, stickerId: string): Promise<UserCollection | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .eq('sticker_id', stickerId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.toDomain(data);
  }

  async save(entity: UserCollection): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .upsert(this.toPersistence(entity));

    if (error) throw error;
  }

  async findByAccount(accountId: string): Promise<UserCollection[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('*')
      .eq('account_id', accountId);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  async findByAccountAndAlbum(accountId: string, albumId: string): Promise<UserCollection[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .select(`
        *,
        stickers!inner(album_id)
      `)
      .eq('account_id', accountId)
      .eq('stickers.album_id', albumId);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  async findByUser(accountId: string, userId: string): Promise<UserCollection[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCountByAccount(accountId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if (error) throw error;
    return count || 0;
  }

  async getRecentByAccount(accountId: string, limit = 10): Promise<UserCollection[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.userStickers)
      .select('*')
      .eq('account_id', accountId)
      .order('obtained_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  private toDomain(raw: Record<string, unknown>): UserCollection {
    return new UserCollection({
      id: raw.id as string,
      accountId: raw.account_id as string,
      userId: raw.user_id as string,
      stickerId: raw.sticker_id as string,
      quantityOwned: raw.quantity_owned as number,
      obtainedAt: raw.obtained_at ? new Date(raw.obtained_at as string) : undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(entity: UserCollection): Record<string, unknown> {
    return {
      id: entity.id,
      account_id: entity.accountId,
      user_id: entity.userId,
      sticker_id: entity.stickerId,
      quantity_owned: entity.quantityOwned,
      obtained_at: entity.obtainedAt.toISOString(),
    };
  }
}
