/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRCodecButton } from '../qr-codec-button';

// ── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

// Mock qrcode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,fake-qr')),
}));

// Mock the config module
let featureEnabled = true;
jest.mock('../../../../config/figuritas-app', () => ({
  isFiguritasAppEnabled: jest.fn(() => featureEnabled),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// ── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  featureEnabled = true;
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('QRCodecButton', () => {
  describe('feature flag gating', () => {
    it('returns null when figuritas app is disabled', () => {
      featureEnabled = false;

      const { container } = render(<QRCodecButton />);

      expect(container.innerHTML).toBe('');
    });

    it('renders the button when figuritas app is enabled', () => {
      render(<QRCodecButton />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows the correct button text', () => {
      render(<QRCodecButton />);

      expect(screen.getByText('📱 Intercambiar vía Figuritas App')).toBeInTheDocument();
    });
  });

  describe('API interaction', () => {
    it('calls the API on button click', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ qrString: '图救test;data' }),
      });

      render(<QRCodecButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockFetch).toHaveBeenCalledWith('/api/figuritas-app/qr-codec');
    });

    it('shows modal with QR image on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ qrString: '图救abc123;def456' }),
      });

      render(<QRCodecButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const qrImage = await screen.findByAltText('QR Code para Figuritas App');
      expect(qrImage).toBeInTheDocument();
    });

    it('shows toast with error on API failure', async () => {
      const { toast } = await import('sonner');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Feature not available' }),
      });

      render(<QRCodecButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await screen.findByRole('button');

      expect(toast.error).toHaveBeenCalledWith('Error al obtener código QR');
    });

    it('shows loading state while fetching', async () => {
      let resolveFetch!: (value: unknown) => void;
      const fetchPromise = new Promise(resolve => { resolveFetch = resolve; });
      mockFetch.mockReturnValueOnce(fetchPromise);

      render(<QRCodecButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toBeDisabled();

      resolveFetch({
        ok: true,
        json: async () => ({ qrString: '图救test;data' }),
      });
    });
  });
});
