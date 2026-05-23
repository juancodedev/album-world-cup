import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { NotFoundError } from '../../../domain/errors/domain.error';

export interface RemoveDuplicateInput {
  accountId: string;
  userId: string;
  stickerId: string;
  quantity?: number;
}

export class RemoveDuplicateUseCase {
  constructor(
    private readonly duplicateRepository: IStickerDuplicateRepository,
  ) {}

  async execute(input: RemoveDuplicateInput): Promise<void> {
    if (!input.accountId) {
      throw new Error('Account ID is required to manage duplicates');
    }

    const duplicate = await this.duplicateRepository.getByUserAndSticker(
      input.accountId,
      input.userId,
      input.stickerId,
    );

    if (!duplicate) {
      throw new NotFoundError('No duplicate record found');
    }

    duplicate.decrement(input.quantity || 1);

    if (duplicate.quantity === 0) {
      await this.duplicateRepository.delete(duplicate.id);
    } else {
      await this.duplicateRepository.save(duplicate);
    }
  }
}
