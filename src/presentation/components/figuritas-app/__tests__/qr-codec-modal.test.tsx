/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRCodecModal } from '../qr-codec-modal';

// ── Mocks ─────────────────────────────────────────────────────────────────

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
  it('renders the QR string in a code block', () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    expect(screen.getByText(QR_STRING)).toBeInTheDocument();
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

    // The close button rendered by the Dialog has the text "Close" in an sr-only span
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the title with Figuritas App heading', () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    expect(screen.getByText(/código qr/i)).toBeInTheDocument();
  });

  it('renders a dialog overlay/backdrop', () => {
    render(<QRCodecModal qrString={QR_STRING} onClose={jest.fn()} />);

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeInTheDocument();
  });
});
