import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { NotFoundError } from '../../../domain/errors/domain.error';

export interface RemoveStickerFromCollectionInput {
  accountId: string;
  userId: string;
  stickerId: string;
}

export class RemoveStickerFromCollectionUseCase {
  constructor(
    private readonly userCollectionRepository: IUserCollectionRepository,
  ) {}

  async execute(input: RemoveStickerFromCollectionInput): Promise<void> {
    if (!input.accountId) {
      throw new Error('Account ID is required');
    }

    const userSticker = await this.userCollectionRepository.getByUserAndSticker(
      input.accountId,
      input.userId,
      input.stickerId,
    );

    if (!userSticker) {
      throw new NotFoundError('Sticker not found in collection');
    }

    if (userSticker.quantityOwned > 1) {
      userSticker.decrementQuantity();
      await this.userCollectionRepository.save(userSticker);
    } else {
      await this.userCollectionRepository.delete(userSticker.id);
    }
  }
}
