import { Sticker } from '../../src/domain/entities/sticker.entity';

export const createStickerFixture = (overrides: Partial<{
  albumId: string;
  number: number;
  playerId: string;
  teamId: string;
  stickerTypeId: string;
  rarity: 'common' | 'rare' | 'legendary' | 'holographic' | 'limited';
  imageUrl: string;
  isSpecial: boolean;
}> = {}): Sticker => {
  return Sticker.create({
    albumId: 'album-1',
    number: 1,
    stickerTypeId: 'type-1',
    rarity: 'common',
    imageUrl: 'https://example.com/sticker.jpg',
    isSpecial: false,
    ...overrides,
  });
};

export const createStickerListFixture = (count: number): Sticker[] => {
  return Array.from({ length: count }, (_, i) =>
    createStickerFixture({
      number: i + 1,
      rarity: i % 5 === 0 ? 'rare' : i % 7 === 0 ? 'legendary' : 'common',
    }),
  );
};
