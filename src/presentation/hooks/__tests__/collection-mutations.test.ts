import { applyOptimisticDuplicate, showMutationToast, MUTATION_MESSAGES } from '../collection-mutations';
import { StickerDTO } from '../../../application/dtos/sticker.dto';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from 'sonner';

function makeSticker(overrides: Partial<StickerDTO> & { id: string }): StickerDTO {
  return {
    albumId: 'album-1',
    number: 1,
    playerId: null,
    playerName: null,
    teamId: null,
    teamName: null,
    teamFlag: null,
    stickerTypeId: 'type-1',
    stickerTypeName: 'Common',
    rarity: 'common',
    rarityLabel: 'Común',
    imageUrl: 'https://example.com/1.webp',
    imageThumbnail: null,
    isSpecial: false,
    specialAttribute: null,
    state: 'missing',
    duplicateCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('applyOptimisticDuplicate', () => {
  it('should increment duplicateCount and set state to duplicate for the target sticker', () => {
    const stickers = [
      makeSticker({ id: 'sticker-1', duplicateCount: 0, state: 'missing' }),
      makeSticker({ id: 'sticker-2', duplicateCount: 2, state: 'duplicate' }),
    ];

    const result = applyOptimisticDuplicate(stickers, 'sticker-1');

    expect(result).toHaveLength(2);
    expect(result[0].duplicateCount).toBe(1);
    expect(result[0].state).toBe('duplicate');
  });

  it('should not modify other stickers', () => {
    const stickers = [
      makeSticker({ id: 'sticker-1', duplicateCount: 0, state: 'missing' }),
      makeSticker({ id: 'sticker-2', duplicateCount: 2, state: 'duplicate' }),
    ];

    const result = applyOptimisticDuplicate(stickers, 'sticker-1');

    expect(result[1].id).toBe('sticker-2');
    expect(result[1].duplicateCount).toBe(2);
    expect(result[1].state).toBe('duplicate');
  });

  it('should handle empty array', () => {
    const result = applyOptimisticDuplicate([], 'sticker-1');
    expect(result).toEqual([]);
  });

  it('should return same array if sticker id is not found', () => {
    const stickers = [
      makeSticker({ id: 'sticker-1', duplicateCount: 0, state: 'missing' }),
    ];

    const result = applyOptimisticDuplicate(stickers, 'nonexistent-id');

    expect(result).toHaveLength(1);
    expect(result[0].duplicateCount).toBe(0);
  });

  it('should work with multiple stickers independently (rapid multi-click scenario)', () => {
    const stickers = [
      makeSticker({ id: 's1', duplicateCount: 1, state: 'duplicate', number: 1 }),
      makeSticker({ id: 's2', duplicateCount: 0, state: 'missing', number: 2 }),
      makeSticker({ id: 's3', duplicateCount: 3, state: 'duplicate', number: 3 }),
    ];

    const result = applyOptimisticDuplicate(stickers, 's2');

    expect(result[0].duplicateCount).toBe(1);
    expect(result[1].duplicateCount).toBe(1);
    expect(result[1].state).toBe('duplicate');
    expect(result[2].duplicateCount).toBe(3);
  });
});

describe('MUTATION_MESSAGES', () => {
  it('should have correct success messages for each mutation type', () => {
    expect(MUTATION_MESSAGES.addSticker.success).toBe('Agregado');
    expect(MUTATION_MESSAGES.removeSticker.success).toBe('Eliminado');
    expect(MUTATION_MESSAGES.incrementDuplicate.success).toBe('Repetida');
  });

  it('should have correct error messages for each mutation type', () => {
    expect(MUTATION_MESSAGES.addSticker.error).toBe('Error al marcar sticker');
    expect(MUTATION_MESSAGES.removeSticker.error).toBe('Error al marcar sticker');
    expect(MUTATION_MESSAGES.incrementDuplicate.error).toBe('Error al marcar sticker');
  });

  it('should have default error for removeDuplicate', () => {
    expect(MUTATION_MESSAGES.removeDuplicate.success).toBe('Eliminado');
    expect(MUTATION_MESSAGES.removeDuplicate.error).toBe('Error al marcar sticker');
  });
});

describe('showMutationToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on success (error is null/undefined)', () => {
    it('should call toast.success for add sticker', () => {
      showMutationToast(null, 'addSticker');
      expect(toast.success).toHaveBeenCalledWith('Agregado', { duration: 3000 });
    });

    it('should call toast.success for remove sticker', () => {
      showMutationToast(null, 'removeSticker');
      expect(toast.success).toHaveBeenCalledWith('Eliminado', { duration: 3000 });
    });

    it('should call toast.success for increment duplicate', () => {
      showMutationToast(null, 'incrementDuplicate');
      expect(toast.success).toHaveBeenCalledWith('Repetida', { duration: 3000 });
    });

    it('should call toast.success for remove duplicate', () => {
      showMutationToast(null, 'removeDuplicate');
      expect(toast.success).toHaveBeenCalledWith('Eliminado', { duration: 3000 });
    });
  });

  describe('on error', () => {
    it('should call toast.error with descriptive message and logged error', () => {
      const error = new Error('API Error');
      showMutationToast(error, 'addSticker');
      expect(toast.error).toHaveBeenCalledWith('Error al marcar sticker', {
        description: 'API Error',
        duration: 4000,
      });
    });

    it('should handle empty error object', () => {
      showMutationToast({}, 'addSticker');
      expect(toast.error).toHaveBeenCalledWith('Error al marcar sticker', {
        description: '[object Object]',
        duration: 4000,
      });
    });
  });

  it('should not call anything if both data and error are null/undefined', () => {
    showMutationToast(null, 'addSticker');
    expect(toast.error).not.toHaveBeenCalled();
  });
});
