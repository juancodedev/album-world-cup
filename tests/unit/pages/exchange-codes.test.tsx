/**
 * @jest-environment jsdom
 *
 * Integration test: exchange page resolves CC codes for special stickers.
 *
 * Verifies that when a COC sticker with teamId=null is in the collection,
 * myDuplicates resolves its code as CC12 instead of #992.
 */
import { render, screen, act } from '@testing-library/react';
import type { StickerDTO } from '../../../src/application/dtos/sticker.dto';

// ── Mocks ──

const mockRouterReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  useSearchParams: () => new URLSearchParams(),
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

jest.mock('../../../src/presentation/hooks/useCurrentAccount', () => ({
  useCurrentAccount: () => ({ data: { id: 'account-1' } }),
}));

const mockUseTracker = jest.fn();
jest.mock('../../../src/presentation/hooks/useTracker', () => ({
  useTracker: () => mockUseTracker(),
}));

jest.mock('../../../src/presentation/hooks/useExchange', () => ({
  usePendingExchangeOffers: () => ({ offers: [], isLoading: false, refetch: jest.fn() }),
  useCreateExchangeOffer: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useAcceptExchangeOffer: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useCancelExchangeOffer: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUserExchangeOffers: () => ({ data: [], isLoading: false }),
}));

jest.mock('../../../src/presentation/layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span>←</span>,
  RefreshCw: () => <span>↻</span>,
  Loader2: () => <span>⏳</span>,
  Plus: () => <span>+</span>,
  Search: () => <span>🔍</span>,
  X: () => <span>✕</span>,
}));

// Mock shadcn components used by CreateExchangeDialog
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogTrigger: ({ render }: { render?: React.ReactNode; children?: React.ReactNode }) => <>{render || null}</>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
}));

// ── Helpers ──

function makeSticker(overrides: Partial<StickerDTO> = {}): StickerDTO {
  return {
    id: 'sticker-1',
    albumId: '00000000-0000-0000-0000-000000000001',
    number: 1,
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
    duplicateCount: 1,
    state: 'missing',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

// ── Tests ──

describe('ExchangePage — special sticker code resolution (T1.5)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
  });

  it('myDuplicates resolves COC sticker code as CC12 instead of #1003', async () => {
    // COC sticker at global number 1003, teamId=null, duplicateCount=3
    const cocSticker = makeSticker({
      id: 'coc-1003',
      number: 1003,
      teamId: null,
      teamName: null,
      isSpecial: true,
      specialAttribute: 'COC',
      duplicateCount: 3,
    });

    mockUseTracker.mockReturnValue({
      data: null,
      collection: [cocSticker],
      isLoading: false,
      addSticker: jest.fn(),
      removeSticker: jest.fn(),
      incrementDuplicate: jest.fn(),
      removeDuplicate: jest.fn(),
      ownedSet: new Set<string>(),
    });

    const ExchangePage = (await import('../../../src/app/(dashboard)/tracker/exchange/page')).default;

    await act(async () => {
      render(<ExchangePage />);
    });

    // The "disponibles" tab shows the code. We look for CC12 in the duplicates list.
    // Note: The exchange page renders duplicates in the "Mis repetidos" area of the
    // CreateExchangeDialog, and also in the tabs. The myDuplicates computation produces
    // the codes displayed. We check that CC12 appears (in both YO DOY and YO QUIERO sections).
    expect(screen.getAllByText('CC12').length).toBeGreaterThanOrEqual(1);
  });

  it('myDuplicates resolves COC sticker code as CC1 (first COC sticker)', async () => {
    // COC sticker at global number 992 (first COC) → should be CC1
    const cocSticker = makeSticker({
      id: 'coc-992',
      number: 992,
      teamId: null,
      teamName: null,
      isSpecial: true,
      specialAttribute: 'COC',
      duplicateCount: 2,
    });

    mockUseTracker.mockReturnValue({
      data: null,
      collection: [cocSticker],
      isLoading: false,
      addSticker: jest.fn(),
      removeSticker: jest.fn(),
      incrementDuplicate: jest.fn(),
      removeDuplicate: jest.fn(),
      ownedSet: new Set<string>(),
    });

    const ExchangePage = (await import('../../../src/app/(dashboard)/tracker/exchange/page')).default;

    await act(async () => {
      render(<ExchangePage />);
    });

    expect(screen.getAllByText('CC1').length).toBeGreaterThanOrEqual(1);
  });

  it('still renders #960 for team stickers (non-special)', async () => {
    // Regular team sticker at number 960
    const teamSticker = makeSticker({
      id: 'team-960',
      number: 960,
      teamId: 'team-bra',
      teamName: 'Brazil',
      duplicateCount: 1,
    });

    mockUseTracker.mockReturnValue({
      data: null,
      collection: [teamSticker],
      isLoading: false,
      addSticker: jest.fn(),
      removeSticker: jest.fn(),
      incrementDuplicate: jest.fn(),
      removeDuplicate: jest.fn(),
      ownedSet: new Set<string>(),
    });

    const ExchangePage = (await import('../../../src/app/(dashboard)/tracker/exchange/page')).default;

    await act(async () => {
      render(<ExchangePage />);
    });

    // Team stickers should still show the raw number format
    expect(screen.getAllByText('#960').length).toBeGreaterThanOrEqual(1);
  });
});
