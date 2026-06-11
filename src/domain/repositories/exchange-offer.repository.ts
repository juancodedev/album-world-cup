import { ExchangeOffer } from '../entities/exchange-offer.entity';

export interface IExchangeOfferRepository {
  findById(id: string): Promise<ExchangeOffer | null>;
  findPending(userId?: string): Promise<ExchangeOffer[]>;
  findByUser(userId: string): Promise<ExchangeOffer[]>;
  save(offer: ExchangeOffer): Promise<void>;
}
