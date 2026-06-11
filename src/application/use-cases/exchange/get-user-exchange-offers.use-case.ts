import { IExchangeOfferRepository } from '../../../domain/repositories/exchange-offer.repository';

export class GetUserExchangeOffersUseCase {
  constructor(
    private readonly exchangeOfferRepository: IExchangeOfferRepository,
  ) {}

  async execute(userId: string) {
    return this.exchangeOfferRepository.findByUser(userId);
  }
}
