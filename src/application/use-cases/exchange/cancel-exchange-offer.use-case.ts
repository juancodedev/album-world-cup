import { IExchangeOfferRepository } from '../../../domain/repositories/exchange-offer.repository';
import { NotFoundError } from '../../../domain/errors/domain.error';

export class CancelExchangeOfferUseCase {
  constructor(
    private readonly exchangeOfferRepository: IExchangeOfferRepository,
  ) {}

  async execute(offerId: string, userId: string): Promise<void> {
    const offer = await this.exchangeOfferRepository.findById(offerId);
    if (!offer) {
      throw new NotFoundError('Exchange offer not found');
    }

    if (offer.fromUserId !== userId) {
      throw new Error('You can only cancel your own offers');
    }

    offer.cancel();
    await this.exchangeOfferRepository.save(offer);
  }
}
