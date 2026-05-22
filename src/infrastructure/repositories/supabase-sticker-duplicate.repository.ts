import { SupabaseClient } from '@supabase/supabase-js';
import { IStickerDuplicateRepository } from '../../domain/repositories/sticker-duplicate.repository';
import { StickerDuplicate } from '../../domain/entities/sticker-duplicate.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseStickerDuplicateRepository implements IStickerDuplicateRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getByUserAndSticker(userId: string, stickerId: string): Promise<StickerDuplicate | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.stickerDuplicates)
      .select('*')
      .eq('user_id', userId)
      .eq('sticker_id', stickerId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async save(entity: StickerDuplicate): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.stickerDuplicates)
      .upsert(this.toPersistence(entity));

    if (error) throw error;
  }

  async findByUser(userId: string): Promise<StickerDuplicate[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.stickerDuplicates)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.stickerDuplicates)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTotalByUser(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.stickerDuplicates)
      .select('quantity')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  }

  private toDomain(raw: Record<string, unknown>): StickerDuplicate {
    return new StickerDuplicate({
      id: raw.id as string,
      userId: raw.user_id as string,
      stickerId: raw.sticker_id as string,
      quantity: raw.quantity as number,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(entity: StickerDuplicate): Record<string, unknown> {
    return {
      id: entity.id,
      user_id: entity.userId,
      sticker_id: entity.stickerId,
      quantity: entity.quantity,
    };
  }
}
