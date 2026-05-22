import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { IAlbumRepository } from '../../../domain/repositories/album.repository';
import { CollectionStatsDTO, TeamStatsDTO, RarityStatsDTO } from '../../dtos/collection-stats.dto';

export class GetCollectionStatsUseCase {
  constructor(
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly stickerDuplicateRepository: IStickerDuplicateRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly albumRepository: IAlbumRepository,
  ) {}

  async execute(userId: string, albumId: string): Promise<CollectionStatsDTO> {
    const album = await this.albumRepository.getById(albumId);
    if (!album) throw new Error('Album not found');

    const allStickers = await this.stickerRepository.getByAlbum(albumId);
    const userStickers = await this.userCollectionRepository.findByUserAndAlbum(userId, albumId);
    const duplicates = await this.stickerDuplicateRepository.findByUser(userId);

    const ownedStickers = userStickers.length;
    const missingStickers = album.totalStickers - ownedStickers;
    const totalDuplicates = duplicates.reduce((sum, d) => sum + d.quantity, 0);
    const progressPercentage = album.totalStickers > 0
      ? Math.round((ownedStickers / album.totalStickers) * 100)
      : 0;

    const ownedSet = new Set(userStickers.map(us => us.stickerId));

    const byTeam: TeamStatsDTO[] = [];
    const teamMap = new Map<string, { total: number; owned: number; name: string; flag: string | null }>();

    for (const sticker of allStickers) {
      if (!sticker.teamId) continue;
      const entry = teamMap.get(sticker.teamId) || { total: 0, owned: 0, name: '', flag: null };
      entry.total += 1;
      if (ownedSet.has(sticker.id)) entry.owned += 1;
      teamMap.set(sticker.teamId, entry);
    }

    teamMap.forEach((value, teamId) => {
      byTeam.push({
        teamId,
        teamName: value.name,
        teamFlag: value.flag,
        total: value.total,
        owned: value.owned,
        progressPercentage: value.total > 0 ? Math.round((value.owned / value.total) * 100) : 0,
      });
    });

    const byRarity: RarityStatsDTO[] = [];
    const rarityMap = new Map<string, { total: number; owned: number; label: string }>();

    for (const sticker of allStickers) {
      const entry = rarityMap.get(sticker.rarity.value) || {
        total: 0, owned: 0, label: sticker.rarity.label,
      };
      entry.total += 1;
      if (ownedSet.has(sticker.id)) entry.owned += 1;
      rarityMap.set(sticker.rarity.value, entry);
    }

    rarityMap.forEach((value, rarity) => {
      byRarity.push({
        rarity,
        rarityLabel: value.label,
        total: value.total,
        owned: value.owned,
        progressPercentage: value.total > 0 ? Math.round((value.owned / value.total) * 100) : 0,
      });
    });

    return {
      totalStickers: album.totalStickers,
      ownedStickers,
      missingStickers,
      duplicateStickers: duplicates.length,
      totalDuplicates,
      progressPercentage,
      completePercentage: progressPercentage,
      isComplete: missingStickers === 0,
      byTeam,
      byRarity,
      recentlyAdded: userStickers.length > 0 ? userStickers.filter(us => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return us.obtainedAt >= weekAgo;
      }).length : 0,
    };
  }
}
