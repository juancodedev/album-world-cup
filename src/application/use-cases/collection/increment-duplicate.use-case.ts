import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
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
  ) {}

  async execute(input: IncrementDuplicateInput): Promise<StickerDuplicateDTO> {
    const sticker = await this.stickerRepository.getById(input.stickerId);
    if (!sticker) {
      throw new NotFoundError(`Sticker with ID ${input.stickerId} not found`);
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
