import { SupabaseClient } from '@supabase/supabase-js';
import { IAccountMemberRepository } from '../../domain/repositories/account-member.repository';
import { AccountMember, AccountRole } from '../../domain/entities/account-member.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

export class SupabaseAccountMemberRepository implements IAccountMemberRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<AccountMember | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getByAccount(accountId: string): Promise<AccountMember[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .select('*')
      .eq('account_id', accountId);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  async getByUserAndAccount(userId: string, accountId: string): Promise<AccountMember | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .select('*')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async getByUser(userId: string): Promise<AccountMember[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((raw) => this.toDomain(raw));
  }

  async save(member: AccountMember): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .insert(this.toPersistence(member));

    if (error) throw error;
  }

  async update(member: AccountMember): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .update({ role: member.role })
      .eq('id', member.id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteByUserAndAccount(userId: string, accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.accountMembers)
      .delete()
      .eq('user_id', userId)
      .eq('account_id', accountId);

    if (error) throw error;
  }

  private toDomain(raw: Record<string, unknown>): AccountMember {
    return new AccountMember({
      id: raw.id as string,
      accountId: raw.account_id as string,
      userId: raw.user_id as string,
      role: raw.role as AccountRole,
      invitedBy: raw.invited_by as string | undefined,
      joinedAt: raw.joined_at ? new Date(raw.joined_at as string) : undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
    });
  }

  private toPersistence(member: AccountMember): Record<string, unknown> {
    return {
      id: member.id,
      account_id: member.accountId,
      user_id: member.userId,
      role: member.role,
      invited_by: member.invitedBy,
      joined_at: member.joinedAt.toISOString(),
    };
  }
}
