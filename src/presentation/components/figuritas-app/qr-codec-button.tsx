'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { isFiguritasAppEnabled } from '../../../config/figuritas-app';
import { QRCodecModal } from './qr-codec-modal';

export function QRCodecButton() {
  const [qrString, setQrString] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isFiguritasAppEnabled()) {
    return null;
  }

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/figuritas-app/qr-codec');
      if (!res.ok) {
        toast.error('Error al obtener código QR');
        return;
      }
      const data = await res.json();
      setQrString(data.qrString);
    } catch {
      toast.error('Error al obtener código QR');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <div className="mt-4">
        <button
          onClick={handleClick}
          disabled={loading}
          className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generando...' : '📱 Intercambiar vía Figuritas App'}
        </button>
      </div>

      {qrString && (
        <QRCodecModal
          qrString={qrString}
          onClose={() => setQrString(null)}
        />
      )}
    </>
  );
}
