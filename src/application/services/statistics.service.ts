import { IUserCollectionRepository } from '../../domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../domain/repositories/sticker.repository';
import { IAlbumRepository } from '../../domain/repositories/album.repository';
import { ITeamRepository } from '../../domain/repositories/team.repository';
import { Progress } from '../../domain/value-objects/progress.vo';
import { FLAG_EMOJI } from '../../shared/constants/flags.constants';

export interface TeamProgressEntry {
  teamId: string;
  teamName: string;
  teamCode: string;
  teamFlag: string | null;
  groupStage: string | null;
  total: number;
  owned: number;
  percentage: number;
}

export class StatisticsService {
  constructor(
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly stickerDuplicateRepository: IStickerDuplicateRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly albumRepository: IAlbumRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}

  async getUserProgress(accountId: string, albumId: string): Promise<Progress> {
    const album = await this.albumRepository.getById(albumId);
    if (!album) throw new Error('Album not found');

    const userStickers = await this.userCollectionRepository.findByAccountAndAlbum(accountId, albumId);
    const duplicates = await this.stickerDuplicateRepository.findByAccount(accountId);
    const totalDuplicates = duplicates.reduce((sum, d) => sum + d.quantity, 0);

    return new Progress(
      album.totalStickers,
      userStickers.length,
      totalDuplicates,
    );
  }

  async getTeamProgress(accountId: string, albumId: string): Promise<TeamProgressEntry[]> {
    const [stickers, userStickers, teams] = await Promise.all([
      this.stickerRepository.getByAlbum(albumId),
      this.userCollectionRepository.findByAccountAndAlbum(accountId, albumId),
      this.teamRepository.getByAlbum(albumId),
    ]);

    const ownedSet = new Set(userStickers.map(us => us.stickerId));
    const teamMap = new Map<string, { total: number; owned: number }>();

    for (const sticker of stickers) {
      if (!sticker.teamId) continue;
      const entry = teamMap.get(sticker.teamId) || { total: 0, owned: 0 };
      entry.total += 1;
      if (ownedSet.has(sticker.id)) entry.owned += 1;
      teamMap.set(sticker.teamId, entry);
    }

    const teamLookup = new Map(teams.map(t => [t.id, t]));

    const result: TeamProgressEntry[] = [];
    teamMap.forEach((value, teamId) => {
      const team = teamLookup.get(teamId);
      const code = team?.code || '';
      result.push({
        teamId,
        teamName: team?.name || 'Desconocido',
        teamCode: code,
        teamFlag: team?.flagUrl || FLAG_EMOJI[code] || null,
        groupStage: team?.groupStage || null,
        total: value.total,
        owned: value.owned,
        percentage: value.total > 0 ? Math.round((value.owned / value.total) * 100) : 0,
      });
    });

    result.sort((a, b) => a.teamName.localeCompare(b.teamName));
    return result;
  }
}
