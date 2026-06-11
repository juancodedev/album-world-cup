import { IExchangeOfferRepository } from '../../../domain/repositories/exchange-offer.repository';

export class GetPendingExchangeOffersUseCase {
  constructor(
    private readonly exchangeOfferRepository: IExchangeOfferRepository,
  ) {}

  async execute(excludeUserId?: string) {
    return this.exchangeOfferRepository.findPending(excludeUserId);
  }
}
