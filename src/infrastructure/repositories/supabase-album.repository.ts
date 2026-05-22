import { SupabaseClient } from '@supabase/supabase-js';
import { IAlbumRepository } from '../../domain/repositories/album.repository';
import { Album } from '../../domain/entities/album.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseAlbumRepository implements IAlbumRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Album | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.albums)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getAll(): Promise<Album[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.albums)
      .select('*')
      .order('year', { ascending: false });

    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async getActive(): Promise<Album[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.albums)
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false });

    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async save(album: Album): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.albums)
      .upsert(this.toPersistence(album));

    if (error) throw error;
  }

  async update(album: Album): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.albums)
      .update(this.toPersistence(album))
      .eq('id', album.id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.albums)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): Album {
    return new Album({
      id: raw.id as string,
      name: raw.name as string,
      year: raw.year as number,
      tournamentType: raw.tournament_type as string,
      description: raw.description as string | undefined,
      imageUrl: raw.image_url as string | undefined,
      totalStickers: raw.total_stickers as number,
      specialStickers: raw.special_stickers as number,
      isActive: raw.is_active as boolean,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(album: Album): Record<string, unknown> {
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      tournament_type: album.tournamentType,
      description: album.description,
      image_url: album.imageUrl,
      total_stickers: album.totalStickers,
      special_stickers: album.specialStickers,
      is_active: album.isActive,
    };
  }
}
