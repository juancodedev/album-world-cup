/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRCodecModal } from '../qr-codec-modal';

// ── Mocks ─────────────────────────────────────────────────────────────────

// Mock qrcode to return a fake data URL synchronously
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,fake-qr-image')),
}));

const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  configurable: true,
});

// ── Tests ─────────────────────────────────────────────────────────────────

const QR_STRING = '图救H4sIAAAA;H4sIAAAA';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('QRCodecModal', () => {
  it('renders a QR code image', async () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    const qrImage = await screen.findByAltText('QR Code para Figuritas App');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,fake-qr-image');
  });

  it('shows a "Copiar" button', () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
  });

  it('copies the QR string to clipboard when "Copiar" is clicked', () => {
    mockWriteText.mockResolvedValueOnce(undefined);

    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /copiar/i }));

    expect(mockWriteText).toHaveBeenCalledWith(QR_STRING);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();

    render(<QRCodecModal qrString={QR_STRING} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the title with Figuritas App heading', () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: /código qr/i })).toBeInTheDocument();
  });

  it('renders a dialog overlay/backdrop', () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeInTheDocument();
  });
});
