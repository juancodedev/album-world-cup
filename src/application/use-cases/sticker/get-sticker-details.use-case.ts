import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { IPlayerRepository } from '../../../domain/repositories/player.repository';
import { ITeamRepository } from '../../../domain/repositories/team.repository';
import { IAlbumRepository } from '../../../domain/repositories/album.repository';
import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { NotFoundError } from '../../../domain/errors/domain.error';
import { StickerDetailDTO } from '../../dtos/sticker.dto';
import { stickerMapper } from '../../mappers/sticker.mapper';

export class GetStickerDetailsUseCase {
  constructor(
    private readonly stickerRepository: IStickerRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly teamRepository: ITeamRepository,
    private readonly albumRepository: IAlbumRepository,
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly duplicateRepository: IStickerDuplicateRepository,
  ) {}

  async execute(stickerId: string, userId?: string, accountId?: string): Promise<StickerDetailDTO> {
    const sticker = await this.stickerRepository.getById(stickerId);
    if (!sticker) throw new NotFoundError(`Sticker ${stickerId} not found`);

    const [album, player, team] = await Promise.all([
      this.albumRepository.getById(sticker.albumId),
      sticker.playerId ? this.playerRepository.getById(sticker.playerId) : null,
      sticker.teamId ? this.teamRepository.getById(sticker.teamId) : null,
    ]);

    let state: 'missing' | 'obtained' | 'duplicate' = 'missing';
    let duplicateCount = 0;

    if (userId && accountId) {
      try {
        const [userSticker, duplicate] = await Promise.all([
          this.userCollectionRepository.getByUserAndSticker(accountId, userId, stickerId),
          this.duplicateRepository.getByUserAndSticker(accountId, userId, stickerId),
        ]);

        if (duplicate) {
          state = 'duplicate';
          duplicateCount = duplicate.quantity;
        } else if (userSticker) {
          state = 'obtained';
        }
      } catch {
        console.error('Error fetching user collection state:', accountId, userId, stickerId);
      }
    }

    return stickerMapper.toDetailDTO(sticker, {
      playerName: player?.name || null,
      playerPosition: player?.position || null,
      playerJerseyNumber: player?.jerseyNumber || null,
      teamName: team?.name || null,
      teamFlag: team?.flagUrl || null,
      stickerTypeName: '',
      albumName: album?.name || '',
      state,
      duplicateCount,
    });
  }
}
