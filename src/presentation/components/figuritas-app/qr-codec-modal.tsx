'use client';

import { useCallback } from 'react';
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
            Copiá este código en la aplicación Figuritas App para intercambiar stickers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-muted rounded-lg p-4 overflow-x-auto">
            <code className="text-xs font-mono break-all select-all whitespace-pre-wrap">
              {qrString}
            </code>
          </div>

          <Button onClick={handleCopy} className="w-full font-bold">
            Copiar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
