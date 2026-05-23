import { IUserCollectionRepository } from '../../../src/domain/repositories/user-collection.repository';
import { IStickerRepository } from '../../../src/domain/repositories/sticker.repository';
import { AddStickerUseCase } from '../../../src/application/use-cases/collection/add-sticker.use-case';
import { CollectionMapper } from '../../../src/application/mappers/collection.mapper';
import { NotFoundError } from '../../../src/domain/errors/domain.error';
import { UserCollection } from '../../../src/domain/entities/user-collection.entity';
import { Sticker } from '../../../src/domain/entities/sticker.entity';


const TEST_ACCOUNT_ID = 'account-1';

describe('AddStickerUseCase Integration', () => {
  let useCase: AddStickerUseCase;
  let mockUserCollectionRepo: jest.Mocked<IUserCollectionRepository>;
  let mockStickerRepo: jest.Mocked<IStickerRepository>;
  let mapper: CollectionMapper;

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

    mapper = new CollectionMapper();
    useCase = new AddStickerUseCase(mockUserCollectionRepo, mockStickerRepo, mapper);
  });

  it('should add a new sticker to user collection', async () => {
    const sticker = Sticker.create({
      albumId: 'album-1',
      number: 1,
      stickerTypeId: 'type-1',
      rarity: 'common',
      imageUrl: 'https://example.com/sticker.jpg',
      isSpecial: false,
    });

    mockStickerRepo.getById.mockResolvedValue(sticker);
    mockUserCollectionRepo.getByUserAndSticker.mockResolvedValue(null);

    const result = await useCase.execute({
      accountId: TEST_ACCOUNT_ID,
      userId: 'user-1',
      stickerId: sticker.id,
      albumId: 'album-1',
    });

    expect(mockUserCollectionRepo.save).toHaveBeenCalled();
    expect(result.quantityOwned).toBe(1);
    expect(result.userId).toBe('user-1');
    expect(result.stickerId).toBe(sticker.id);
  });

  it('should increment quantity for existing sticker', async () => {
    const sticker = Sticker.create({
      albumId: 'album-1',
      number: 1,
      stickerTypeId: 'type-1',
      rarity: 'common',
      imageUrl: 'https://example.com/sticker.jpg',
      isSpecial: false,
    });

    const existingCollection = UserCollection.create(TEST_ACCOUNT_ID, 'user-1', sticker.id);

    mockStickerRepo.getById.mockResolvedValue(sticker);
    mockUserCollectionRepo.getByUserAndSticker.mockResolvedValue(existingCollection);

    const result = await useCase.execute({
      accountId: TEST_ACCOUNT_ID,
      userId: 'user-1',
      stickerId: sticker.id,
      albumId: 'album-1',
    });

    expect(result.quantityOwned).toBe(2);
  });

  it('should throw NotFoundError when sticker does not exist', async () => {
    mockStickerRepo.getById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: TEST_ACCOUNT_ID,
        userId: 'user-1',
        stickerId: 'non-existent',
        albumId: 'album-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw error when sticker does not belong to album', async () => {
    const sticker = Sticker.create({
      albumId: 'album-2',
      number: 1,
      stickerTypeId: 'type-1',
      rarity: 'common',
      imageUrl: 'https://example.com/sticker.jpg',
      isSpecial: false,
    });

    mockStickerRepo.getById.mockResolvedValue(sticker);

    await expect(
      useCase.execute({
        accountId: TEST_ACCOUNT_ID,
        userId: 'user-1',
        stickerId: sticker.id,
        albumId: 'album-1',
      }),
    ).rejects.toThrow('Sticker does not belong to this album');
  });
});
