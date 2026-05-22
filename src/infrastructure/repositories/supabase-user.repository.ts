import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.users)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data || data.deleted_at) return null;
    return this.toDomain(data);
  }

  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.users)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!data || data.deleted_at) return null;
    return this.toDomain(data);
  }

  async getByAuthUid(authUid: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.users)
      .select('*')
      .eq('auth_uid', authUid)
      .maybeSingle();

    if (error) throw error;
    if (!data || data.deleted_at) return null;
    return this.toDomain(data);
  }

  async save(user: User): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.users)
      .insert(this.toPersistence(user));

    if (error) throw error;
  }

  async update(user: User): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.users)
      .update(this.toPersistence(user))
      .eq('id', user.id);

    if (error) throw error;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.users)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): User {
    return new User({
      id: raw.id as string,
      email: raw.email as string,
      fullName: raw.full_name as string | undefined,
      avatarUrl: raw.avatar_url as string | undefined,
      authProvider: raw.auth_provider as 'google' | 'email',
      authUid: raw.auth_uid as string,
      preferences: raw.preferences as Record<string, unknown> | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
      deletedAt: raw.deleted_at ? new Date(raw.deleted_at as string) : undefined,
    });
  }

  private toPersistence(user: User): Record<string, unknown> {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      avatar_url: user.avatarUrl,
      auth_provider: user.authProvider,
      auth_uid: user.authUid,
      preferences: user.preferences,
    };
  }
}
