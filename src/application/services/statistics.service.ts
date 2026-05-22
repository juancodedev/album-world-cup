import { IUserCollectionRepository } from '../../domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../domain/repositories/sticker.repository';
import { IAlbumRepository } from '../../domain/repositories/album.repository';
import { Progress } from '../../domain/value-objects/progress.vo';

export class StatisticsService {
  constructor(
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly stickerDuplicateRepository: IStickerDuplicateRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly albumRepository: IAlbumRepository,
  ) {}

  async getUserProgress(userId: string, albumId: string): Promise<Progress> {
    const album = await this.albumRepository.getById(albumId);
    if (!album) throw new Error('Album not found');

    const userStickers = await this.userCollectionRepository.findByUserAndAlbum(userId, albumId);
    const duplicates = await this.stickerDuplicateRepository.findByUser(userId);
    const totalDuplicates = duplicates.reduce((sum, d) => sum + d.quantity, 0);

    return new Progress(
      album.totalStickers,
      userStickers.length,
      totalDuplicates,
    );
  }

  async getTeamProgress(userId: string, albumId: string): Promise<Record<string, Progress>> {
    const stickers = await this.stickerRepository.getByAlbum(albumId);
    const userStickers = await this.userCollectionRepository.findByUserAndAlbum(userId, albumId);
    const ownedSet = new Set(userStickers.map(us => us.stickerId));

    const teamMap = new Map<string, { total: number; owned: number }>();

    for (const sticker of stickers) {
      if (!sticker.teamId) continue;
      const entry = teamMap.get(sticker.teamId) || { total: 0, owned: 0 };
      entry.total += 1;
      if (ownedSet.has(sticker.id)) entry.owned += 1;
      teamMap.set(sticker.teamId, entry);
    }

    const result: Record<string, Progress> = {};
    teamMap.forEach((value, teamId) => {
      result[teamId] = new Progress(value.total, value.owned, 0);
    });

    return result;
  }
}
