import { StatisticsService, TeamProgressEntry } from '../../../src/application/services/statistics.service';
import { IUserCollectionRepository } from '../../../src/domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../../src/domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../../src/domain/repositories/sticker.repository';
import { IAlbumRepository } from '../../../src/domain/repositories/album.repository';
import { ITeamRepository } from '../../../src/domain/repositories/team.repository';
import { Progress } from '../../../src/domain/value-objects/progress.vo';
import { Sticker } from '../../../src/domain/entities/sticker.entity';
import { Team } from '../../../src/domain/entities/team.entity';
import { Album } from '../../../src/domain/entities/album.entity';
import { StickerDuplicate } from '../../../src/domain/entities/sticker-duplicate.entity';
import { UserCollection } from '../../../src/domain/entities/user-collection.entity';

const ALBUM_ID = 'album-1';
const ACCOUNT_ID = 'account-1';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let mockUserCollectionRepo: jest.Mocked<IUserCollectionRepository>;
  let mockStickerDuplicateRepo: jest.Mocked<IStickerDuplicateRepository>;
  let mockStickerRepo: jest.Mocked<IStickerRepository>;
  let mockAlbumRepo: jest.Mocked<IAlbumRepository>;
  let mockTeamRepo: jest.Mocked<ITeamRepository>;

  beforeEach(() => {
    mockUserCollectionRepo = {
      getByUserAndSticker: jest.fn(),
      save: jest.fn(),
      findByAccount: jest.fn(),
      findByAccountAndAlbum: jest.fn(),
      findByUser: jest.fn(),
      delete: jest.fn(),
      getCountByAccount: jest.fn(),
      getRecentByAccount: jest.fn(),
    };

    mockStickerDuplicateRepo = {
      findByAccount: jest.fn(),
      findBySticker: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockStickerRepo = {
      getById: jest.fn(),
      getAll: jest.fn(),
      getByAlbum: jest.fn(),
      getByTeam: jest.fn(),
      getByNumber: jest.fn(),
      search: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
    };

    mockAlbumRepo = {
      getById: jest.fn(),
      getAll: jest.fn(),
      save: jest.fn(),
    };

    mockTeamRepo = {
      getById: jest.fn(),
      getAll: jest.fn(),
      getByAlbum: jest.fn(),
      save: jest.fn(),
    };

    service = new StatisticsService(
      mockUserCollectionRepo,
      mockStickerDuplicateRepo,
      mockStickerRepo,
      mockAlbumRepo,
      mockTeamRepo,
    );
  });

  describe('getUserProgress', () => {
    it('should return progress with correct values', async () => {
      const album = Album.create({
        name: 'Test Album',
        year: 2026,
        tournamentType: 'world_cup',
        totalStickers: 100,
        specialStickers: 10,
      });
      mockAlbumRepo.getById.mockResolvedValue(album);
      mockUserCollectionRepo.findByAccountAndAlbum.mockResolvedValue(
        Array.from({ length: 30 }, (_, i) =>
          UserCollection.create(ACCOUNT_ID, 'user-1', `sticker-${i + 1}`)),
      );
      mockStickerDuplicateRepo.findByAccount.mockResolvedValue([]);

      const result = await service.getUserProgress(ACCOUNT_ID, ALBUM_ID);

      expect(result).toBeInstanceOf(Progress);
      expect(result.total).toBe(100);
      expect(result.owned).toBe(30);
      expect(result.duplicates).toBe(0);
      expect(result.percentage).toBe(30);
    });

    it('should include duplicates in progress', async () => {
      const album = Album.create({
        name: 'Test',
        year: 2026,
        tournamentType: 'test',
        totalStickers: 100,
        specialStickers: 0,
      });
      mockAlbumRepo.getById.mockResolvedValue(album);
      mockUserCollectionRepo.findByAccountAndAlbum.mockResolvedValue(
        Array.from({ length: 20 }, (_, i) =>
          UserCollection.create(ACCOUNT_ID, 'user-1', `sticker-${i + 1}`)),
      );
      mockStickerDuplicateRepo.findByAccount.mockResolvedValue([
        StickerDuplicate.create(ACCOUNT_ID, 'user-1', 's1', 3),
        StickerDuplicate.create(ACCOUNT_ID, 'user-1', 's2', 2),
      ]);

      const result = await service.getUserProgress(ACCOUNT_ID, ALBUM_ID);

      expect(result.duplicates).toBe(5);
      expect(result.owned).toBe(20);
    });

    it('should throw when album not found', async () => {
      mockAlbumRepo.getById.mockResolvedValue(null);

      await expect(service.getUserProgress(ACCOUNT_ID, ALBUM_ID)).rejects.toThrow('Album not found');
    });
  });

  describe('getTeamProgress', () => {
    function makeSticker(id: string, teamId: string, number: number): Sticker {
      return new Sticker({
        id,
        albumId: ALBUM_ID,
        number,
        stickerTypeId: 'type-1',
        rarity: 'common',
        imageUrl: `https://example.com/${number}.webp`,
        isSpecial: false,
        teamId,
      });
    }

    it('should return team progress with metadata', async () => {
      const team1 = Team.create({
        albumId: ALBUM_ID,
        confederationId: 'c1',
        name: 'Mexico',
        code: 'MEX',
        flagUrl: '🇲🇽',
        groupStage: 'A',
      });
      const team2 = Team.create({
        albumId: ALBUM_ID,
        confederationId: 'c2',
        name: 'Brazil',
        code: 'BRA',
        flagUrl: '🇧🇷',
        groupStage: 'C',
      });

      const stickers = [
        makeSticker('s1', team1.id, 1),
        makeSticker('s2', team1.id, 2),
        makeSticker('s3', team1.id, 3),
        makeSticker('s4', team2.id, 4),
        makeSticker('s5', team2.id, 5),
      ];

      const userStickers = [
        UserCollection.create(ACCOUNT_ID, 'user-1', 's1'),
        UserCollection.create(ACCOUNT_ID, 'user-1', 's2'),
        UserCollection.create(ACCOUNT_ID, 'user-1', 's4'),
      ];

      mockStickerRepo.getByAlbum.mockResolvedValue(stickers);
      mockUserCollectionRepo.findByAccountAndAlbum.mockResolvedValue(userStickers);
      mockTeamRepo.getByAlbum.mockResolvedValue([team1, team2]);

      const result: TeamProgressEntry[] = await service.getTeamProgress(ACCOUNT_ID, ALBUM_ID);

      expect(result).toHaveLength(2);

      const mexico = result.find(t => t.teamCode === 'MEX')!;
      expect(mexico.teamName).toBe('Mexico');
      expect(mexico.teamFlag).toBe('🇲🇽');
      expect(mexico.groupStage).toBe('A');
      expect(mexico.total).toBe(3);
      expect(mexico.owned).toBe(2);
      expect(mexico.percentage).toBe(67);

      const brazil = result.find(t => t.teamCode === 'BRA')!;
      expect(brazil.teamName).toBe('Brazil');
      expect(brazil.total).toBe(2);
      expect(brazil.owned).toBe(1);
      expect(brazil.percentage).toBe(50);
    });

    it('should return empty array when no stickers exist', async () => {
      mockStickerRepo.getByAlbum.mockResolvedValue([]);
      mockUserCollectionRepo.findByAccountAndAlbum.mockResolvedValue([]);
      mockTeamRepo.getByAlbum.mockResolvedValue([]);

      const result = await service.getTeamProgress(ACCOUNT_ID, ALBUM_ID);
      expect(result).toEqual([]);
    });

    it('should skip stickers without teamId', async () => {
      const special = Sticker.create({
        albumId: ALBUM_ID,
        number: 1,
        stickerTypeId: 'type-1',
        rarity: 'common',
        imageUrl: 'https://example.com/1.webp',
        isSpecial: true,
        specialAttribute: 'FWC',
      });

      mockStickerRepo.getByAlbum.mockResolvedValue([special]);
      mockUserCollectionRepo.findByAccountAndAlbum.mockResolvedValue([]);
      mockTeamRepo.getByAlbum.mockResolvedValue([]);

      const result = await service.getTeamProgress(ACCOUNT_ID, ALBUM_ID);
      expect(result).toEqual([]);
    });
  });
});
