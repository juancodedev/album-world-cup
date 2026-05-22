import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { StickerDTO } from '../../dtos/sticker.dto';
import { stickerMapper } from '../../mappers/sticker.mapper';

export class GetUserCollectionUseCase {
  constructor(
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly duplicateRepository: IStickerDuplicateRepository,
  ) {}

  async execute(userId: string, albumId: string): Promise<StickerDTO[]> {
    const allStickers = await this.stickerRepository.getByAlbum(albumId);
    const userStickers = await this.userCollectionRepository.findByUserAndAlbum(userId, albumId);
    const duplicates = await this.duplicateRepository.findByUser(userId);

    const ownedMap = new Map(userStickers.map(us => [us.stickerId, us]));
    const duplicateMap = new Map(duplicates.map(d => [d.stickerId, d]));

    return allStickers.map(sticker => {
      const owned = ownedMap.has(sticker.id);
      const dup = duplicateMap.get(sticker.id);

      return stickerMapper.toDTO(sticker, {
        state: dup ? 'duplicate' : owned ? 'obtained' : 'missing',
        duplicateCount: dup?.quantity || 0,
      });
    });
  }
}
