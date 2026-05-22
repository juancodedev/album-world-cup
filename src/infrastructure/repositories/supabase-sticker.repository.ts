import { SupabaseClient } from '@supabase/supabase-js';
import { IStickerRepository, StickerFilters } from '../../domain/repositories/sticker.repository';
import { Sticker } from '../../domain/entities/sticker.entity';
import { RarityValue } from '../../domain/value-objects/rarity.vo';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseStickerRepository implements IStickerRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Sticker | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.stickers)
      .select(`
        *,
        players(name, position, jersey_number),
        teams(name, code, flag_url),
        sticker_types(name),
        albums(name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getAll(filters?: StickerFilters): Promise<Sticker[]> {
    let query = this.supabase
      .from(SUPABASE_TABLES.stickers)
      .select('*');

    if (filters?.albumId) query = query.eq('album_id', filters.albumId);
    if (filters?.teamId) query = query.eq('team_id', filters.teamId);
    if (filters?.rarity) query = query.eq('rarity', filters.rarity);
    if (filters?.isSpecial !== undefined) query = query.eq('is_special', filters.isSpecial);
    if (filters?.stickerTypeId) query = query.eq('sticker_type_id', filters.stickerTypeId);

    if (filters?.search) {
      query = query.or(
        `number::text.ilike.%${filters.search}%`
      );
    }

    query = query.order('number', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async getByAlbum(albumId: string): Promise<Sticker[]> {
    return this.getAll({ albumId });
  }

  async getByTeam(teamId: string): Promise<Sticker[]> {
    return this.getAll({ teamId });
  }

  async getByNumber(albumId: string, number: number): Promise<Sticker | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.stickers)
      .select('*')
      .eq('album_id', albumId)
      .eq('number', number)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async search(query: string, albumId?: string): Promise<Sticker[]> {
    return this.getAll({ search: query, albumId });
  }

  async save(sticker: Sticker): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.stickers)
      .upsert(this.toPersistence(sticker));

    if (error) throw error;
  }

  async saveMany(stickers: Sticker[]): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.stickers)
      .upsert(stickers.map(s => this.toPersistence(s)));

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): Sticker {
    return new Sticker({
      id: raw.id as string,
      albumId: raw.album_id as string,
      number: raw.number as number,
      playerId: raw.player_id as string | undefined,
      teamId: raw.team_id as string | undefined,
      stickerTypeId: raw.sticker_type_id as string,
      rarity: raw.rarity as RarityValue,
      imageUrl: raw.image_url as string,
      imageThumbnail: raw.image_thumbnail as string | undefined,
      isSpecial: raw.is_special as boolean,
      specialAttribute: raw.special_attribute as string | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(sticker: Sticker): Record<string, unknown> {
    return {
      id: sticker.id,
      album_id: sticker.albumId,
      number: sticker.number,
      player_id: sticker.playerId || null,
      team_id: sticker.teamId || null,
      sticker_type_id: sticker.stickerTypeId,
      rarity: sticker.rarity.value,
      image_url: sticker.imageUrl,
      image_thumbnail: sticker.imageThumbnail || null,
      is_special: sticker.isSpecial,
      special_attribute: sticker.specialAttribute || null,
    };
  }
}
