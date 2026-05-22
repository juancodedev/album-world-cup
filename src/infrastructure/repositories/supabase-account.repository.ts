import { SupabaseClient } from '@supabase/supabase-js';
import { IAccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseAccountRepository implements IAccountRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accounts)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getBySlug(slug: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accounts)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getByUser(userId: string): Promise<Account[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accounts)
      .select('*, account_members!inner(user_id)')
      .eq('account_members.user_id', userId);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  async save(account: Account): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accounts)
      .insert(this.toPersistence(account));

    if (error) throw error;
  }

  async update(account: Account): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accounts)
      .update(this.toPersistence(account))
      .eq('id', account.id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accounts)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): Account {
    return new Account({
      id: raw.id as string,
      name: raw.name as string,
      slug: raw.slug as string,
      description: raw.description as string | undefined,
      avatarUrl: raw.avatar_url as string | undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at as string) : undefined,
    });
  }

  private toPersistence(account: Account): Record<string, unknown> {
    return {
      id: account.id,
      name: account.name,
      slug: account.slug,
      description: account.description,
      avatar_url: account.avatarUrl,
    };
  }
}
