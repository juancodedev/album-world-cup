import { IShareCollectionRepository } from '../../../domain/repositories/share-collection.repository';
import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ITeamRepository } from '../../../domain/repositories/team.repository';
import { NotFoundError } from '../../../domain/errors/domain.error';
import { ShareCollectionDTO } from '../../dtos/share-collection.dto';
import { shareCollectionMapper } from '../../mappers/share-collection.mapper';

export class GetSharedCollectionUseCase {
  constructor(
    private readonly shareRepository: IShareCollectionRepository,
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly userRepository: IUserRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(code: string): Promise<ShareCollectionDTO> {
    const share = await this.shareRepository.getByCode(code);
    if (!share) throw new NotFoundError('Shared collection not found');

    if (share.isExpired) throw new Error('This shared collection has expired');

    const user = await this.userRepository.getById(share.userId);
    if (!user) throw new NotFoundError('User not found');

    // Increment view count
    share.incrementViewCount();
    await this.shareRepository.update(share);

    const DEFAULT_ALBUM_ID = '00000000-0000-0000-0000-000000000001';

    const allStickers = await this.stickerRepository.getByAlbum(DEFAULT_ALBUM_ID);
    const userStickers = await this.userCollectionRepository.findByAccount(share.accountId);
    const ownedIds = new Set(userStickers.map(s => s.stickerId));

    const teams = await this.teamRepository.getByAlbum(DEFAULT_ALBUM_ID);
    const teamStats = teams.map(team => {
      const teamStickers = allStickers.filter(s => s.teamId === team.id);
      const owned = teamStickers.filter(s => ownedIds.has(s.id)).length;
      return {
        teamId: team.id,
        teamName: team.name,
        teamFlag: team.flagUrl || null,
        total: teamStickers.length,
        owned,
      };
    }).filter(t => t.total > 0);

    return shareCollectionMapper.toDTO(share, {
      userName: user.fullName || user.email,
      userAvatar: user.avatarUrl || null,
      teams: teamStats,
      stats: {
        total: allStickers.length,
        owned: userStickers.length,
        missing: allStickers.length - userStickers.length,
        percentage: allStickers.length > 0
          ? Math.round((userStickers.length / allStickers.length) * 100)
          : 0,
      },
    });
  }
}
