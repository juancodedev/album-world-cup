import { Rarity } from '../../../../src/domain/value-objects/rarity.vo';

describe('Rarity', () => {
  describe('create', () => {
    it('should create valid rarities', () => {
      const rarities = ['common', 'rare', 'legendary', 'holographic', 'limited'];
      for (const r of rarities) {
        const rarity = Rarity.create(r);
        expect(rarity.value).toBe(r);
      }
    });

    it('should throw for invalid rarity', () => {
      expect(() => Rarity.create('ultra-rare')).toThrow('Invalid rarity: ultra-rare');
      expect(() => Rarity.create('')).toThrow();
    });
  });

  describe('label', () => {
    it.each([
      ['common', 'Común'],
      ['rare', 'Rara'],
      ['legendary', 'Legendaria'],
      ['holographic', 'Holográfica'],
      ['limited', 'Edición Limitada'],
    ])('returns "%s" for %s', (value, expected) => {
      expect(Rarity.create(value).label).toBe(expected);
    });
  });

  describe('color', () => {
    it('should return a hex color for each rarity', () => {
      const rarities = ['common', 'rare', 'legendary', 'holographic', 'limited'];
      for (const r of rarities) {
        expect(Rarity.create(r).color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe('equals', () => {
    it('should return true for same rarity', () => {
      expect(Rarity.create('common').equals(Rarity.create('common'))).toBe(true);
    });

    it('should return false for different rarities', () => {
      expect(Rarity.create('common').equals(Rarity.create('rare'))).toBe(false);
    });
  });
});
