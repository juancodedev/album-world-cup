import { IShareCollectionRepository } from '../../../../domain/repositories/share-collection.repository';
import { IUserCollectionRepository } from '../../../../domain/repositories/user-collection.repository';
import { IStickerDuplicateRepository } from '../../../../domain/repositories/sticker-duplicate.repository';
import { IStickerRepository } from '../../../../domain/repositories/sticker.repository';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { ITeamRepository } from '../../../../domain/repositories/team.repository';
import { GetSharedCollectionUseCase } from '../get-shared-collection.use-case';
import { ShareCollection } from '../../../../domain/entities/share-collection.entity';
import { User } from '../../../../domain/entities/user.entity';
import { Sticker } from '../../../../domain/entities/sticker.entity';
import { Team } from '../../../../domain/entities/team.entity';
import { UserCollection } from '../../../../domain/entities/user-collection.entity';
import { NotFoundError } from '../../../../domain/errors/domain.error';

describe('GetSharedCollectionUseCase', () => {
  let useCase: GetSharedCollectionUseCase;
  let mockShareRepo: jest.Mocked<IShareCollectionRepository>;
  let mockUserCollectionRepo: jest.Mocked<IUserCollectionRepository>;
  let mockDuplicateRepo: jest.Mocked<IStickerDuplicateRepository>;
  let mockStickerRepo: jest.Mocked<IStickerRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockTeamRepo: jest.Mocked<ITeamRepository>;

  beforeEach(() => {
    mockShareRepo = {
      getByCode: jest.fn(),
      getByAccount: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

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

    mockDuplicateRepo = {
      getByUserAndSticker: jest.fn(),
      save: jest.fn(),
      findByAccount: jest.fn(),
      findByUser: jest.fn(),
      delete: jest.fn(),
      getTotalByAccount: jest.fn(),
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

    mockUserRepo = {
      getById: jest.fn(),
      getByEmail: jest.fn(),
      getByAuthUid: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockTeamRepo = {
      getById: jest.fn(),
      getAll: jest.fn(),
      getByAlbum: jest.fn(),
      save: jest.fn(),
    };

    useCase = new GetSharedCollectionUseCase(
      mockShareRepo,
      mockUserCollectionRepo,
      mockDuplicateRepo,
      mockStickerRepo,
      mockUserRepo,
      mockTeamRepo,
    );
  });

  const ALBUM_ID = '00000000-0000-0000-0000-000000000001';

  it('should return shared collection DTO with stats and team info', async () => {
    const share = new ShareCollection({
      accountId: 'account-1',
      userId: 'user-1',
      shareCode: 'TEST123',
      isPublic: true,
      showDuplicates: true,
      showMissing: true,
      viewCount: 5,
    });

    const user = new User({
      email: 'test@example.com',
      fullName: 'Test User',
      authProvider: 'email',
      authUid: 'auth-1',
    });

    const team = new Team({
      id: 'team-1',
      albumId: ALBUM_ID,
      confederationId: 'confed-1',
      name: 'Mexico',
      code: 'MEX',
      flagUrl: 'https://example.com/mex.png',
    });

    const sticker = Sticker.create({
      albumId: ALBUM_ID,
      number: 1,
      stickerTypeId: 'type-1',
      rarity: 'common',
      imageUrl: 'https://example.com/sticker.jpg',
      isSpecial: false,
      teamId: 'team-1',
    });

    const ownedSticker = UserCollection.create('account-1', 'user-1', sticker.id);

    mockShareRepo.getByCode.mockResolvedValue(share);
    mockUserRepo.getById.mockResolvedValue(user);
    mockStickerRepo.getByAlbum.mockResolvedValue([sticker]);
    mockUserCollectionRepo.findByAccount.mockResolvedValue([ownedSticker]);
    mockTeamRepo.getByAlbum.mockResolvedValue([team]);

    const result = await useCase.execute('TEST123');

    expect(result.shareCode).toBe('TEST123');
    expect(result.userName).toBe('Test User');
    expect(result.stats).toEqual({
      total: 1,
      owned: 1,
      missing: 0,
      percentage: 100,
    });
    expect(result.teams).toHaveLength(1);
    expect(result.teams[0]).toEqual({
      teamId: 'team-1',
      teamCode: 'MEX',
      teamName: 'Mexico',
      teamFlag: 'https://example.com/mex.png',
      total: 1,
      owned: 1,
      stickers: [{ number: 1, position: 1, owned: true, duplicateCount: 0 }],
    });
    expect(mockShareRepo.update).toHaveBeenCalled();
  });

  it('should throw when share code not found', async () => {
    mockShareRepo.getByCode.mockResolvedValue(null);

    await expect(useCase.execute('INVALID')).rejects.toThrow(NotFoundError);
  });

  it('should throw when share has expired', async () => {
    const expired = new ShareCollection({
      accountId: 'account-1',
      userId: 'user-1',
      shareCode: 'EXPIRED',
      isPublic: true,
      showDuplicates: true,
      showMissing: true,
      viewCount: 0,
      expiresAt: new Date('2020-01-01'),
    });

    mockShareRepo.getByCode.mockResolvedValue(expired);

    await expect(useCase.execute('EXPIRED')).rejects.toThrow('expired');
  });

  it('should throw when user not found', async () => {
    const share = new ShareCollection({
      accountId: 'account-1',
      userId: 'user-1',
      shareCode: 'TEST456',
      isPublic: true,
      showDuplicates: true,
      showMissing: true,
      viewCount: 0,
    });

    mockShareRepo.getByCode.mockResolvedValue(share);
    mockUserRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute('TEST456')).rejects.toThrow(NotFoundError);
  });

  it('should use email as fallback when user has no fullName', async () => {
    const share = new ShareCollection({
      accountId: 'account-1',
      userId: 'user-1',
      shareCode: 'TEST789',
      isPublic: true,
      showDuplicates: true,
      showMissing: true,
      viewCount: 0,
    });

    const user = new User({
      email: 'juan@example.com',
      authProvider: 'email',
      authUid: 'auth-1',
    });

    mockShareRepo.getByCode.mockResolvedValue(share);
    mockUserRepo.getById.mockResolvedValue(user);
    mockStickerRepo.getByAlbum.mockResolvedValue([]);
    mockUserCollectionRepo.findByAccount.mockResolvedValue([]);
    mockTeamRepo.getByAlbum.mockResolvedValue([]);

    const result = await useCase.execute('TEST789');

    expect(result.userName).toBe('juan@example.com');
  });
});
