// ── Module mocks (must be before imports due to jest hoisting) ────────────

jest.mock('../../../../../infrastructure/database/supabase.server', () => ({
  createServerSideClient: jest.fn(),
}));

jest.mock('../../../../../config/figuritas-app', () => ({
  isFiguritasAppEnabled: jest.fn(),
  QR_CODEC_MAX_STICKERS: 984,
  QR_CODEC_BITMAP_SIZE: 123,
}));

jest.mock('../../../../../domain/services/qr-codec.service', () => ({
  QRCodecService: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      body,
      json: async () => body,
    })),
  },
  NextRequest: jest.fn().mockImplementation((url: string) => ({
    url,
    nextUrl: new URL(url),
  })),
}));

// ── Imports (mocked modules resolve after jest.mock) ──────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../route';
import {
  createServerSideClient,
} from '../../../../../infrastructure/database/supabase.server';
import { isFiguritasAppEnabled } from '../../../../../config/figuritas-app';
import { QRCodecService } from '../../../../../domain/services/qr-codec.service';

// ── Shared test values ────────────────────────────────────────────────────

const MOCK_USER = { id: 'user-123', email: 'test@example.com' };
const MOCK_ACCOUNT_ID = 'account-456';

function makeRequest(url = 'http://localhost:3000/api/figuritas-app/qr-codec'): NextRequest {
  return new NextRequest(url);
}

function makeStickerRow(id: string, number: number) {
  return { id, number };
}

const ALL_STICKERS = Array.from({ length: 984 }, (_, i) =>
  makeStickerRow(`sticker-${i + 1}`, i + 1),
);

// ── Helpers to build mock supabase chains ──────────────────────────────────

function mockStickerQuery(mockFrom: jest.Mock, stickers: Array<{ id: string; number: number }>) {
  const lteMock = jest.fn().mockResolvedValue({ data: stickers, error: null });
  const gteMock = jest.fn().mockReturnValue({ lte: lteMock });
  const eqMock = jest.fn().mockReturnValue({ gte: gteMock });
  mockFrom
    .mockReturnValueOnce({ select: jest.fn().mockReturnValue({ eq: eqMock }) });
}

// Default fallback: any unexpected from() call returns a safe chain
function installDefaultFallback(mockFrom: jest.Mock) {
  mockFrom.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockResolvedValue({ data: [], error: null }),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
  });
}

function mockAccountQuery(mockFrom: jest.Mock, accountId: string | null) {
  const singleMock = jest.fn().mockResolvedValue(
    accountId
      ? { data: { account_id: accountId }, error: null }
      : { data: null, error: { code: 'PGRST116', message: 'No rows' } },
  );
  const limitMock = jest.fn().mockReturnValue({ single: singleMock });
  const eqMock = jest.fn().mockReturnValue({ limit: limitMock });
  mockFrom
    .mockReturnValueOnce({ select: jest.fn().mockReturnValue({ eq: eqMock }) });
}

function mockOwnedQuery(mockFrom: jest.Mock, stickerIds: string[]) {
  const eqMock2 = jest.fn().mockResolvedValue({
    data: stickerIds.map(id => ({ sticker_id: id })),
    error: null,
  });
  const eqMock1 = jest.fn().mockReturnValue({ eq: eqMock2 });
  mockFrom
    .mockReturnValueOnce({ select: jest.fn().mockReturnValue({ eq: eqMock1 }) });
}

function mockDuplicateQuery(mockFrom: jest.Mock, rows: Array<{ sticker_id: string; quantity: number }>) {
  const eqMock2 = jest.fn().mockResolvedValue({ data: rows, error: null });
  const eqMock1 = jest.fn().mockReturnValue({ eq: eqMock2 });
  mockFrom
    .mockReturnValueOnce({ select: jest.fn().mockReturnValue({ eq: eqMock1 }) });
}

// ── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Default: authenticated + feature enabled
  jest.mocked(createServerSideClient).mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }) },
    from: jest.fn(),
    rpc: jest.fn(),
  } as never);

  jest.mocked(isFiguritasAppEnabled).mockReturnValue(true);
});

describe('GET /api/figuritas-app/qr-codec', () => {
  describe('authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      jest.mocked(createServerSideClient).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
        from: jest.fn(),
        rpc: jest.fn(),
      } as never);

      const response = await GET(makeRequest());
      expect(response.status).toBe(401);
    });
  });

  describe('feature flag', () => {
    it('returns 404 when feature is disabled', async () => {
      jest.mocked(isFiguritasAppEnabled).mockReturnValue(false);

      const response = await GET(makeRequest());
      expect(response.status).toBe(404);
    });
  });

  describe('account lookup', () => {
    it('returns 400 when user has no accounts', async () => {
      const mockFrom = jest.fn();
      jest.mocked(createServerSideClient).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }) },
        from: mockFrom,
        rpc: jest.fn(),
      } as never);

      mockAccountQuery(mockFrom, null); // No account
      installDefaultFallback(mockFrom);

      const response = await GET(makeRequest());
      expect(response.status).toBe(400);
    });
  });

  describe('successful encoding', () => {
    it('returns 200 with qrString when authenticated and feature is enabled', async () => {
      const mockEncodeV2 = jest.fn().mockReturnValue('图救test-avail;test-wanted');
      jest.mocked(QRCodecService).mockImplementation(() => ({ encodeV2: mockEncodeV2 }));

      const mockFrom = jest.fn();
      jest.mocked(createServerSideClient).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }) },
        from: mockFrom,
        rpc: jest.fn(),
      } as never);

      mockAccountQuery(mockFrom, MOCK_ACCOUNT_ID);
      mockStickerQuery(mockFrom, ALL_STICKERS);
      mockOwnedQuery(mockFrom, ['sticker-1', 'sticker-2', 'sticker-3']);
      mockDuplicateQuery(mockFrom, [
        { sticker_id: 'sticker-5', quantity: 2 },
        { sticker_id: 'sticker-10', quantity: 1 },
      ]);
      installDefaultFallback(mockFrom);

      const response = await GET(makeRequest());

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ qrString: '图救test-avail;test-wanted' });
      expect(mockEncodeV2).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 500 on database error', async () => {
      const mockFrom = jest.fn();
      jest.mocked(createServerSideClient).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }) },
        from: mockFrom,
        rpc: jest.fn(),
      } as never);

      mockAccountQuery(mockFrom, MOCK_ACCOUNT_ID);
      // Sticker query throws
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockRejectedValue(new Error('DB connection failed')),
            }),
          }),
        }),
      });
      installDefaultFallback(mockFrom);

      const response = await GET(makeRequest());
      expect(response.status).toBe(500);
    });
  });
});
