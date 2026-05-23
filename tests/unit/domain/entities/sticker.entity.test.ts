import { Sticker } from '../../../../src/domain/entities/sticker.entity';

describe('Sticker', () => {
  describe('create', () => {
    it('should create a basic sticker', () => {
      const sticker = Sticker.create({
        albumId: 'album-1',
        number: 1,
        stickerTypeId: 'type-1',
        rarity: 'common',
        imageUrl: 'https://example.com/1.webp',
        isSpecial: false,
      });

      expect(sticker.albumId).toBe('album-1');
      expect(sticker.number).toBe(1);
      expect(sticker.rarity.value).toBe('common');
      expect(sticker.isSpecial).toBe(false);
      expect(sticker.id).toBeDefined();
      expect(sticker.displayName).toBe('#1');
    });

    it('should create a special sticker with team and player', () => {
      const sticker = Sticker.create({
        albumId: 'album-1',
        number: 100,
        stickerTypeId: 'type-1',
        rarity: 'legendary',
        imageUrl: 'https://example.com/100.webp',
        isSpecial: true,
        specialAttribute: 'FWC',
        teamId: 'team-1',
        playerId: 'player-1',
        imageThumbnail: 'https://example.com/100_thumb.webp',
      });

      expect(sticker.isSpecial).toBe(true);
      expect(sticker.specialAttribute).toBe('FWC');
      expect(sticker.teamId).toBe('team-1');
      expect(sticker.playerId).toBe('player-1');
      expect(sticker.rarity.value).toBe('legendary');
    });
  });

  describe('constructor with explicit id', () => {
    it('should use provided id', () => {
      const sticker = new Sticker({
        id: 'sticker-fixed',
        albumId: 'album-1',
        number: 5,
        stickerTypeId: 'type-1',
        rarity: 'rare',
        imageUrl: 'https://example.com/5.webp',
        isSpecial: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      expect(sticker.id).toBe('sticker-fixed');
      expect(sticker.createdAt).toEqual(new Date('2026-01-01'));
    });
  });

  describe('displayName', () => {
    it('should return formatted number', () => {
      const sticker = Sticker.create({
        albumId: 'album-1',
        number: 42,
        stickerTypeId: 'type-1',
        rarity: 'common',
        imageUrl: 'https://example.com/42.webp',
        isSpecial: false,
      });

      expect(sticker.displayName).toBe('#42');
    });
  });
});
