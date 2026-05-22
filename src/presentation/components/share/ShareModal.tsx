'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { useState } from 'react';

interface ShareModalProps {
  shareCode: string | null;
  onGenerate: () => void;
  isGenerating: boolean;
  children?: React.ReactNode;
}

export function ShareModal({ shareCode, onGenerate, isGenerating }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = shareCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareCode}`
    : null;

  const handleCopy = async () => {
    if (shareUrl) {
      if (typeof navigator !== 'undefined') {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-full" variant="outline" />}>
        {shareCode ? 'Ver enlace de compartir' : 'Generar enlace'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir colección</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!shareCode ? (
            <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generando...' : 'Generar código de compartir'}
            </Button>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Tu código único</p>
                <p className="text-2xl font-bold tracking-widest text-blue-600">{shareCode}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopy} className="flex-1">
                  {copied ? '✓ Copiado' : 'Copiar enlace'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Comparte este enlace para que otros vean tu progreso
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
