import { SupabaseClient } from '@supabase/supabase-js';
import { IExchangeOfferRepository } from '../../domain/repositories/exchange-offer.repository';
import { ExchangeOffer } from '../../domain/entities/exchange-offer.entity';
import { SUPABASE_TABLES } from '../database/supabase.config';

interface ExchangeOfferRow {
  id: string;
  from_user_id: string;
  from_account_id: string;
  offered_sticker_id: string;
  requested_sticker_id: string | null;
  status: string;
  accepted_by: string | null;
  accepted_account_id: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseExchangeOfferRepository implements IExchangeOfferRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<ExchangeOffer | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.exchangeOffers)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.toDomain(data);
  }

  async findPending(excludeUserId?: string): Promise<ExchangeOffer[]> {
    let query = this.supabase
      .from(SUPABASE_TABLES.exchangeOffers)
      .select('*')
      .eq('status', 'pending');

    if (excludeUserId) {
      query = query.neq('from_user_id', excludeUserId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => this.toDomain(row));
  }

  async findByUser(userId: string): Promise<ExchangeOffer[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.exchangeOffers)
      .select('*')
      .or(`from_user_id.eq.${userId},accepted_by.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => this.toDomain(row));
  }

  async save(offer: ExchangeOffer): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.exchangeOffers)
      .upsert(this.toPersistence(offer));

    if (error) throw error;
  }

  private toDomain(row: ExchangeOfferRow): ExchangeOffer {
    return new ExchangeOffer({
      id: row.id,
      fromUserId: row.from_user_id,
      fromAccountId: row.from_account_id,
      offeredStickerId: row.offered_sticker_id,
      requestedStickerId: row.requested_sticker_id ?? undefined,
      status: row.status as ExchangeOffer['status'],
      acceptedBy: row.accepted_by ?? undefined,
      acceptedAccountId: row.accepted_account_id ?? undefined,
      message: row.message ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private toPersistence(offer: ExchangeOffer): Record<string, unknown> {
    return {
      id: offer.id,
      from_user_id: offer.fromUserId,
      from_account_id: offer.fromAccountId,
      offered_sticker_id: offer.offeredStickerId,
      requested_sticker_id: offer.requestedStickerId ?? null,
      status: offer.status,
      accepted_by: offer.acceptedBy ?? null,
      accepted_account_id: offer.acceptedAccountId ?? null,
      message: offer.message ?? null,
      updated_at: offer.updatedAt.toISOString(),
    };
  }
}
