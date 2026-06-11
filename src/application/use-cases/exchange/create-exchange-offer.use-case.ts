import { IExchangeOfferRepository } from '../../../domain/repositories/exchange-offer.repository';
import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { ExchangeOffer } from '../../../domain/entities/exchange-offer.entity';
import { NotFoundError } from '../../../domain/errors/domain.error';

export interface CreateExchangeOfferInput {
  fromUserId: string;
  fromAccountId: string;
  offeredStickerId: string;
  requestedStickerId?: string;
  message?: string;
}

export class CreateExchangeOfferUseCase {
  constructor(
    private readonly exchangeOfferRepository: IExchangeOfferRepository,
    private readonly duplicateRepository: IStickerDuplicateRepository,
  ) {}

  async execute(input: CreateExchangeOfferInput): Promise<ExchangeOffer> {
    if (!input.fromAccountId) {
      throw new Error('Account ID is required to create an exchange offer');
    }

    // Verify the offered sticker is actually a duplicate
    const duplicate = await this.duplicateRepository.getByUserAndSticker(
      input.fromAccountId,
      input.fromUserId,
      input.offeredStickerId,
    );

    if (!duplicate || duplicate.quantity < 1) {
      throw new NotFoundError(
        `You don't have a duplicate of this sticker to offer`,
      );
    }

    const offer = ExchangeOffer.create({
      fromUserId: input.fromUserId,
      fromAccountId: input.fromAccountId,
      offeredStickerId: input.offeredStickerId,
      requestedStickerId: input.requestedStickerId,
      message: input.message,
    });

    await this.exchangeOfferRepository.save(offer);
    return offer;
  }
}
