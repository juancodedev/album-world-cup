import { StickerState } from '../../../../src/domain/value-objects/sticker-state.vo';

describe('StickerState', () => {
  describe('from', () => {
    it('should return DUPLICATE when duplicates > 0', () => {
      const state = StickerState.from(true, 2);
      expect(state.value).toBe('duplicate');
    });

    it('should return OBTAINED when owned and no duplicates', () => {
      const state = StickerState.from(true, 0);
      expect(state.value).toBe('obtained');
    });

    it('should return MISSING when not owned', () => {
      const state = StickerState.from(false, 0);
      expect(state.value).toBe('missing');
    });
  });

  describe('label', () => {
    it('should return correct labels', () => {
      expect(StickerState.MISSING.label).toBe('Faltante');
      expect(StickerState.OBTAINED.label).toBe('Obtenida');
      expect(StickerState.DUPLICATE.label).toBe('Repetida');
    });
  });

  describe('equals', () => {
    it('should return true for same state', () => {
      expect(StickerState.MISSING.equals(StickerState.MISSING)).toBe(true);
    });

    it('should return false for different states', () => {
      expect(StickerState.MISSING.equals(StickerState.OBTAINED)).toBe(false);
    });
  });
});
