/**
 * @jest-environment jsdom
 *
 * Integration test: duplicates page renders special stickers card.
 *
 * Verifies that when data.specials contains stickers with duplicateCount > 0,
 * the page renders a "Secciones especiales" card with CC-prefixed codes.
 */
import { render, screen } from '@testing-library/react';
import type { StickerDTO } from '../../../src/application/dtos/sticker.dto';
import type { SpecialData, GroupData } from '../../../src/presentation/hooks/useTracker';

// ── Mocks ──

const mockRouterReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock('next/link', () => {
  return ({ children, ...props }: Record<string, unknown>) => {
    const { href, ...rest } = props;
    return <a href={href as string} {...rest}>{children as React.ReactNode}</a>;
  };
});

const mockUseAuth = jest.fn();
jest.mock('../../../src/presentation/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseTracker = jest.fn();
jest.mock('../../../src/presentation/hooks/useTracker', () => ({
  useTracker: () => mockUseTracker(),
}));

jest.mock('../../../src/presentation/layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Suppress lucide-react warnings about missing icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span>←</span>,
  Plus: () => <span>+</span>,
  Minus: () => <span>−</span>,
}));

// ── Helpers ──

function makeSticker(
  id: string,
  number: number,
  overrides: Partial<StickerDTO> = {},
): StickerDTO {
  return {
    id,
    albumId: '00000000-0000-0000-0000-000000000001',
    number,
    playerId: null,
    playerName: null,
    teamId: 'team-1',
    teamName: 'Team',
    teamFlag: null,
    stickerTypeId: 'type-1',
    stickerTypeName: 'Standard',
    rarity: 'common',
    rarityLabel: 'Common',
    imageUrl: '',
    imageThumbnail: null,
    isSpecial: false,
    specialAttribute: null,
    duplicateCount: 0,
    state: 'missing',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

function makeSpecialData(overrides: Partial<SpecialData> = {}): SpecialData {
  return {
    code: 'COC',
    displayCode: 'CC',
    name: 'Coca-Cola Exclusivos',
    icon: '🥤',
    count: 14,
    stickers: [],
    ownedCount: 0,
    ...overrides,
  };
}

// ── Tests ──

describe('DuplicatesPage — special stickers card (T1.4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
  });

  it('renders "Secciones especiales" card when data.specials has duplicates', async () => {
    // COC sticker with duplicateCount > 0
    const cocSticker = makeSticker('coc-1', 992, {
      teamId: null,
      teamName: 'COC',
      isSpecial: true,
      specialAttribute: 'COC',
      duplicateCount: 3,
    });

    const specialData = makeSpecialData({
      code: 'COC',
      displayCode: 'CC',
      stickers: [cocSticker],
    });

    const emptyGroup: GroupData = { id: 'A', teams: [], totalOwned: 0, totalCount: 0 };

    mockUseTracker.mockReturnValue({
      data: {
        groups: [emptyGroup],
        specials: [specialData],
        totalOwned: 0,
        totalCount: 1005,
        totalDuplicates: 3,
      },
      collection: [cocSticker],
      isLoading: false,
      addSticker: jest.fn(),
      removeSticker: jest.fn(),
      incrementDuplicate: jest.fn(),
      removeDuplicate: jest.fn(),
      ownedSet: new Set<string>(),
    });

    const DuplicatesPage = (await import('../../../src/app/(dashboard)/tracker/duplicates/page')).default;
    render(<DuplicatesPage />);

    // Should show the "Secciones especiales" heading
    expect(screen.getByText('Secciones especiales')).toBeTruthy();

    // Should show the COC section name
    expect(screen.getByText('Coca-Cola Exclusivos')).toBeTruthy();

    // Should show CC codes (not COC)
    expect(screen.getByText('CC1')).toBeTruthy();
  });

  it('does NOT render special card when specials have zero duplicates', async () => {
    const cocSticker = makeSticker('coc-1', 992, {
      teamId: null,
      teamName: 'COC',
      isSpecial: true,
      specialAttribute: 'COC',
      duplicateCount: 0,
    });

    const specialData = makeSpecialData({
      code: 'COC',
      stickers: [cocSticker],
    });

    const emptyGroup: GroupData = { id: 'A', teams: [], totalOwned: 0, totalCount: 0 };

    mockUseTracker.mockReturnValue({
      data: {
        groups: [emptyGroup],
        specials: [specialData],
        totalOwned: 0,
        totalCount: 1005,
        totalDuplicates: 0,
      },
      collection: [cocSticker],
      isLoading: false,
      addSticker: jest.fn(),
      removeSticker: jest.fn(),
      incrementDuplicate: jest.fn(),
      removeDuplicate: jest.fn(),
      ownedSet: new Set<string>(),
    });

    const DuplicatesPage = (await import('../../../src/app/(dashboard)/tracker/duplicates/page')).default;
    render(<DuplicatesPage />);

    // Should NOT show the special sections card
    expect(screen.queryByText('Secciones especiales')).toBeNull();
  });
});
