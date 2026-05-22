import { SupabaseClient } from '@supabase/supabase-js';
import { IPlayerRepository, PlayerFilters } from '../../domain/repositories/player.repository';
import { Player } from '../../domain/entities/player.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabasePlayerRepository implements IPlayerRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Player | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.players)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getAll(filters?: PlayerFilters): Promise<Player[]> {
    let query = this.supabase
      .from(SUPABASE_TABLES.players)
      .select('*');

    if (filters?.teamId) query = query.eq('team_id', filters.teamId);

    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async getByTeam(teamId: string): Promise<Player[]> {
    return this.getAll({ teamId });
  }

  async search(query: string): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.players)
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async save(player: Player): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.players)
      .upsert(this.toPersistence(player));

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): Player {
    return new Player({
      id: raw.id as string,
      teamId: raw.team_id as string,
      name: raw.name as string,
      position: raw.position as string,
      jerseyNumber: raw.jersey_number as number | undefined,
      photoUrl: raw.photo_url as string | undefined,
      stats: raw.stats as Record<string, unknown> | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(player: Player): Record<string, unknown> {
    return {
      id: player.id,
      team_id: player.teamId,
      name: player.name,
      position: player.position,
      jersey_number: player.jerseyNumber,
      photo_url: player.photoUrl,
      stats: player.stats,
    };
  }
}
