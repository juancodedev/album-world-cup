import { Progress } from '../../../../src/domain/value-objects/progress.vo';

describe('Progress', () => {
  describe('constructor', () => {
    it('should create progress with given values', () => {
      const progress = new Progress(100, 30, 5);
      expect(progress.total).toBe(100);
      expect(progress.owned).toBe(30);
      expect(progress.duplicates).toBe(5);
    });

    it('should be frozen', () => {
      const progress = new Progress(100, 30, 5);
      expect(Object.isFrozen(progress)).toBe(true);
    });
  });

  describe('missing', () => {
    it('should calculate missing stickers', () => {
      const progress = new Progress(100, 30, 0);
      expect(progress.missing).toBe(70);
    });

    it('should not return negative', () => {
      const progress = new Progress(100, 150, 0);
      expect(progress.missing).toBe(0);
    });
  });

  describe('percentage', () => {
    it('should calculate correct percentage', () => {
      const progress = new Progress(100, 25, 0);
      expect(progress.percentage).toBe(25);
    });

    it('should return 0 for zero total', () => {
      const progress = new Progress(0, 0, 0);
      expect(progress.percentage).toBe(0);
    });

    it('should return 100 when complete', () => {
      const progress = new Progress(100, 100, 0);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('formattedPercentage', () => {
    it('should return percentage with % sign', () => {
      const progress = new Progress(100, 50, 0);
      expect(progress.formattedPercentage).toBe('50%');
    });
  });

  describe('isComplete', () => {
    it('should return true when all owned', () => {
      const progress = new Progress(20, 20, 0);
      expect(progress.isComplete).toBe(true);
    });

    it('should return false when missing stickers', () => {
      const progress = new Progress(20, 19, 0);
      expect(progress.isComplete).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for identical progress', () => {
      const a = new Progress(100, 50, 5);
      const b = new Progress(100, 50, 5);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = new Progress(100, 50, 5);
      const b = new Progress(100, 51, 5);
      expect(a.equals(b)).toBe(false);
    });
  });
});
