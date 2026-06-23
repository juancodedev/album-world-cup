'use client';

import { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRCodecModalProps {
  qrString: string;
  onClose: () => void;
}

export function QRCodecModal({ qrString, onClose }: QRCodecModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(qrString, {
      width: 400,
      margin: 2,
      color: { dark: '#000', light: '#fff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrError(true));
  }, [qrString]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrString);
      toast.success('Copiado al portapapeles');
    } catch {
      toast.error('Error al copiar');
    }
  }, [qrString]);

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR — Figuritas App</DialogTitle>
          <DialogDescription>
            Escaneá este código con la aplicación Figuritas App para intercambiar stickers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 flex flex-col items-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code para Figuritas App"
              className="w-64 h-64 rounded-lg border"
            />
          ) : qrError ? (
            <div className="w-64 h-64 rounded-lg border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              Error al generar el QR
            </div>
          ) : (
            <div className="w-64 h-64 rounded-lg border bg-muted flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <Button onClick={handleCopy} className="w-full font-bold" variant="outline">
            Copiar código QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
