import { AddStickerUseCase } from '../use-cases/collection/add-sticker.use-case';
import { IncrementDuplicateUseCase } from '../use-cases/collection/increment-duplicate.use-case';
import { RemoveDuplicateUseCase } from '../use-cases/collection/remove-duplicate.use-case';
import { GetUserCollectionUseCase } from '../use-cases/collection/get-user-collection.use-case';
import { GetCollectionStatsUseCase } from '../use-cases/collection/get-collection-stats.use-case';
import { CollectionStatsDTO } from '../dtos/collection-stats.dto';
import { StickerDTO } from '../dtos/sticker.dto';
import { UserCollectionDTO } from '../dtos/user-collection.dto';
import { StickerDuplicateDTO } from '../dtos/sticker-duplicate.dto';

export class CollectionService {
  constructor(
    private readonly addStickerUseCase: AddStickerUseCase,
    private readonly incrementDuplicateUseCase: IncrementDuplicateUseCase,
    private readonly removeDuplicateUseCase: RemoveDuplicateUseCase,
    private readonly getUserCollectionUseCase: GetUserCollectionUseCase,
    private readonly getCollectionStatsUseCase: GetCollectionStatsUseCase,
  ) {}

  async addStickerToCollection(input: {
    userId: string; stickerId: string; albumId: string;
  }): Promise<UserCollectionDTO> {
    return this.addStickerUseCase.execute(input);
  }

  async incrementDuplicateCount(input: {
    userId: string; stickerId: string; quantity?: number;
  }): Promise<StickerDuplicateDTO> {
    return this.incrementDuplicateUseCase.execute(input);
  }

  async removeDuplicateCount(input: {
    userId: string; stickerId: string; quantity?: number;
  }): Promise<void> {
    return this.removeDuplicateUseCase.execute(input);
  }

  async getUserCollection(userId: string, albumId: string): Promise<StickerDTO[]> {
    return this.getUserCollectionUseCase.execute(userId, albumId);
  }

  async getStats(userId: string, albumId: string): Promise<CollectionStatsDTO> {
    return this.getCollectionStatsUseCase.execute(userId, albumId);
  }
}
