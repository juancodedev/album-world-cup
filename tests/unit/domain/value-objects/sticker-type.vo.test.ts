import { StickerType } from '../../../../src/domain/value-objects/sticker-type.vo';

describe('StickerType', () => {
  describe('create', () => {
    it('should create valid sticker types', () => {
      const types = ['player', 'team', 'stadium', 'emblem', 'special', 'action', 'legend'];
      for (const t of types) {
        const stickerType = StickerType.create(t);
        expect(stickerType.value).toBe(t);
      }
    });

    it('should throw for invalid type', () => {
      expect(() => StickerType.create('invalid')).toThrow('Invalid sticker type: invalid');
    });
  });

  describe('label', () => {
    it.each([
      ['player', 'Jugador'],
      ['team', 'Selección'],
      ['stadium', 'Estadio'],
      ['emblem', 'Escudo'],
      ['special', 'Especial'],
      ['action', 'Acción'],
      ['legend', 'Leyenda'],
    ])('returns "%s" for %s', (value, expected) => {
      expect(StickerType.create(value).label).toBe(expected);
    });
  });

  describe('equals', () => {
    it('should return true for same type', () => {
      expect(StickerType.create('player').equals(StickerType.create('player'))).toBe(true);
    });

    it('should return false for different types', () => {
      expect(StickerType.create('player').equals(StickerType.create('team'))).toBe(false);
    });
  });
});
