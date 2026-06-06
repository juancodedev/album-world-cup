/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useTracker } from '../../../src/presentation/hooks/useTracker';
import type { StickerDTO } from '../../../src/application/dtos/sticker.dto';

// ---- Mocks ----

jest.mock('../../../src/presentation/providers/AuthProvider', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'user-1' }, isLoading: false })),
}));

jest.mock('../../../src/presentation/hooks/useCurrentAccount', () => ({
  useCurrentAccount: jest.fn(() => ({ data: { id: 'account-1' } })),
}));

const mockUseCollection = jest.fn();
jest.mock('../../../src/presentation/hooks/useCollection', () => ({
  useCollection: (...args: unknown[]) => mockUseCollection(...args),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isLoading: false })),
}));

// ---- Helpers ----

function createSticker(id: string, state: 'missing' | 'obtained'): StickerDTO {
  return {
    id,
    albumId: '00000000-0000-0000-0000-000000000001',
    number: 1,
    playerId: null,
    playerName: null,
    teamId: 'team-1',
    teamName: 'Team 1',
    teamFlag: null,
    stickerTypeId: 'type-1',
    stickerTypeName: 'Standard',
    rarity: 'common',
    rarityLabel: 'Common',
    imageUrl: '/sticker.png',
    imageThumbnail: null,
    isSpecial: false,
    specialAttribute: null,
    state,
    duplicateCount: 0,
    createdAt: '2026-01-01',
  };
}

const MOCK_COLLECTION_RETURN = {
  collection: [] as StickerDTO[],
  isLoading: false,
  addSticker: jest.fn(),
  removeSticker: jest.fn(),
  incrementDuplicate: jest.fn(),
  removeDuplicate: jest.fn(),
};

// ---- Tests ----

describe('useTracker — immediate local toggle feedback (PR 1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCollection.mockReturnValue({
      ...MOCK_COLLECTION_RETURN,
      collection: [],
    });
  });

  it('reflects addSticker in ownedSet immediately (before server flush)', () => {
    const stickerId = 'sticker-test-1';
    mockUseCollection.mockReturnValue({
      ...MOCK_COLLECTION_RETURN,
      collection: [createSticker(stickerId, 'missing')],
    });

    const { result } = renderHook(() => useTracker());

    // Before toggle: sticker is missing, not in ownedSet
    expect(result.current.ownedSet.has(stickerId)).toBe(false);

    act(() => {
      result.current.addSticker(stickerId);
    });

    // After toggle: ownedSet MUST include it immediately (via toggleVersion dep)
    expect(result.current.ownedSet.has(stickerId)).toBe(true);
  });

  it('reflects removeSticker in ownedSet immediately (before server flush)', () => {
    const stickerId = 'sticker-test-2';
    mockUseCollection.mockReturnValue({
      ...MOCK_COLLECTION_RETURN,
      collection: [createSticker(stickerId, 'obtained')],
    });

    const { result } = renderHook(() => useTracker());

    // Before toggle: sticker is obtained, so it IS in ownedSet
    expect(result.current.ownedSet.has(stickerId)).toBe(true);

    act(() => {
      result.current.removeSticker(stickerId);
    });

    // After toggle: ownedSet must NOT include it (toggleVersion forces re-compute)
    expect(result.current.ownedSet.has(stickerId)).toBe(false);
  });
});
