import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { StickerDuplicate } from '../../../domain/entities/sticker-duplicate.entity';
import { NotFoundError } from '../../../domain/errors/domain.error';
import { StickerDuplicateDTO } from '../../dtos/sticker-duplicate.dto';

export interface IncrementDuplicateInput {
  accountId: string;
  userId: string;
  stickerId: string;
  quantity?: number;
}

export class IncrementDuplicateUseCase {
  constructor(
    private readonly duplicateRepository: IStickerDuplicateRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly userCollectionRepository: IUserCollectionRepository,
  ) {}

  async execute(input: IncrementDuplicateInput): Promise<StickerDuplicateDTO> {
    if (!input.accountId) {
      throw new Error('Account ID is required to manage duplicates');
    }

    const sticker = await this.stickerRepository.getById(input.stickerId);
    if (!sticker) {
      throw new NotFoundError(`Sticker with ID ${input.stickerId} not found`);
    }

    // A sticker must be owned before it can have duplicates
    const owned = await this.userCollectionRepository.getByUserAndSticker(
      input.accountId,
      input.userId,
      input.stickerId,
    );
    if (!owned) {
      throw new NotFoundError(`Sticker ${input.stickerId} is not in your collection. Mark it as obtained first.`);
    }

    let duplicate = await this.duplicateRepository.getByUserAndSticker(
      input.accountId,
      input.userId,
      input.stickerId,
    );

    if (duplicate) {
      duplicate.increment(input.quantity || 1);
    } else {
      duplicate = StickerDuplicate.create(input.accountId, input.userId, input.stickerId, input.quantity || 1);
    }

    await this.duplicateRepository.save(duplicate);

    return {
      id: duplicate.id,
      userId: duplicate.userId,
      stickerId: duplicate.stickerId,
      stickerNumber: sticker.number,
      stickerImage: sticker.imageUrl,
      playerName: null,
      teamName: null,
      quantity: duplicate.quantity,
      createdAt: duplicate.createdAt.toISOString(),
    };
  }
}
