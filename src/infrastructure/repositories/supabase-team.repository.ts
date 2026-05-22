import { SupabaseClient } from '@supabase/supabase-js';
import { ITeamRepository, TeamFilters } from '../../domain/repositories/team.repository';
import { Team } from '../../domain/entities/team.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseTeamRepository implements ITeamRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Team | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.teams)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getAll(filters?: TeamFilters): Promise<Team[]> {
    let query = this.supabase
      .from(SUPABASE_TABLES.teams)
      .select('*');

    if (filters?.albumId) query = query.eq('album_id', filters.albumId);
    if (filters?.confederationId) query = query.eq('confederation_id', filters.confederationId);

    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((raw: Record<string, unknown>) => this.toDomain(raw));
  }

  async getByAlbum(albumId: string): Promise<Team[]> {
    return this.getAll({ albumId });
  }

  async save(team: Team): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.teams)
      .upsert(this.toPersistence(team));

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): Team {
    return new Team({
      id: raw.id as string,
      albumId: raw.album_id as string,
      confederationId: raw.confederation_id as string,
      name: raw.name as string,
      code: raw.code as string,
      flagUrl: raw.flag_url as string | undefined,
      groupStage: raw.group_stage as string | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(team: Team): Record<string, unknown> {
    return {
      id: team.id,
      album_id: team.albumId,
      confederation_id: team.confederationId,
      name: team.name,
      code: team.code,
      flag_url: team.flagUrl,
      group_stage: team.groupStage,
    };
  }
}
