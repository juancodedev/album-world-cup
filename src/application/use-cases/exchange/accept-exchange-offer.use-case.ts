import { IExchangeOfferRepository } from '../../../domain/repositories/exchange-offer.repository';
import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { UserCollection } from '../../../domain/entities/user-collection.entity';
import { NotFoundError } from '../../../domain/errors/domain.error';

export interface AcceptExchangeOfferInput {
  offerId: string;
  acceptedByUserId: string;
  acceptedByAccountId: string;
}

export class AcceptExchangeOfferUseCase {
  constructor(
    private readonly exchangeOfferRepository: IExchangeOfferRepository,
    private readonly duplicateRepository: IStickerDuplicateRepository,
    private readonly userCollectionRepository: IUserCollectionRepository,
  ) {}

  async execute(input: AcceptExchangeOfferInput): Promise<void> {
    const offer = await this.exchangeOfferRepository.findById(input.offerId);
    if (!offer) {
      throw new NotFoundError('Exchange offer not found');
    }

    // Validate and mark as accepted (also guards self-accept)
    offer.accept(input.acceptedByUserId, input.acceptedByAccountId);

    // --- Verify offered sticker is still available ---
    const offeredDuplicate = await this.duplicateRepository.getByUserAndSticker(
      offer.fromAccountId,
      offer.fromUserId,
      offer.offeredStickerId,
    );
    if (!offeredDuplicate || offeredDuplicate.quantity < 1) {
      throw new NotFoundError(
        'The offered sticker is no longer available as a duplicate',
      );
    }

    // --- If bilateral: transfer requested sticker from acceptor → offerer ---
    if (offer.isBilateral && offer.requestedStickerId) {
      await this.transferStickerToUser({
        stickerId: offer.requestedStickerId,
        fromAccountId: input.acceptedByAccountId,
        fromUserId: input.acceptedByUserId,
        toAccountId: offer.fromAccountId,
        toUserId: offer.fromUserId,
      });
    }

    // --- Transfer offered sticker from offerer → acceptor ---
    // Remove duplicate from offerer
    if (offeredDuplicate.quantity <= 1) {
      await this.duplicateRepository.delete(offeredDuplicate.id);
    } else {
      offeredDuplicate.decrement(1);
      await this.duplicateRepository.save(offeredDuplicate);
    }

    // Add offered sticker to acceptor's collection
    let acceptorEntry = await this.userCollectionRepository.getByUserAndSticker(
      input.acceptedByAccountId,
      input.acceptedByUserId,
      offer.offeredStickerId,
    );
    if (acceptorEntry) {
      acceptorEntry.incrementQuantity();
    } else {
      acceptorEntry = UserCollection.create(
        input.acceptedByAccountId,
        input.acceptedByUserId,
        offer.offeredStickerId,
      );
    }
    await this.userCollectionRepository.save(acceptorEntry);

    // --- Complete the exchange ---
    offer.complete();
    await this.exchangeOfferRepository.save(offer);
  }

  /**
   * Transfer a sticker from one user's collection to another.
   * Removes it (or decrements) from the giver, adds it to the receiver.
   */
  private async transferStickerToUser(params: {
    stickerId: string;
    fromAccountId: string;
    fromUserId: string;
    toAccountId: string;
    toUserId: string;
  }): Promise<void> {
    const { stickerId, fromAccountId, fromUserId, toAccountId, toUserId } = params;

    // Remove from giver's duplicates if present
    const duplicate = await this.duplicateRepository.getByUserAndSticker(
      fromAccountId,
      fromUserId,
      stickerId,
    );
    if (duplicate && duplicate.quantity > 0) {
      if (duplicate.quantity <= 1) {
        await this.duplicateRepository.delete(duplicate.id);
      } else {
        duplicate.decrement(1);
        await this.duplicateRepository.save(duplicate);
      }
    }

    // Remove from giver's collection
    const owned = await this.userCollectionRepository.getByUserAndSticker(
      fromAccountId,
      fromUserId,
      stickerId,
    );
    if (owned) {
      if (owned.quantityOwned <= 1) {
        await this.userCollectionRepository.delete(owned.id);
      } else {
        owned.decrementQuantity();
        await this.userCollectionRepository.save(owned);
      }
    } else {
      throw new NotFoundError(
        'You don\'t have the requested sticker in your collection',
      );
    }

    // Add to receiver's collection
    let receiverEntry = await this.userCollectionRepository.getByUserAndSticker(
      toAccountId,
      toUserId,
      stickerId,
    );
    if (receiverEntry) {
      receiverEntry.incrementQuantity();
    } else {
      receiverEntry = UserCollection.create(toAccountId, toUserId, stickerId);
    }
    await this.userCollectionRepository.save(receiverEntry);
  }
}
