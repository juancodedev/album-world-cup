'use client';

import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { StickerCard } from '../stickers/StickerCard';

interface MissingListProps {
  stickers: StickerDTO[];
  onStickerClick?: (id: string) => void;
}

export function MissingList({ stickers, onStickerClick }: MissingListProps) {
  const missingStickers = stickers.filter(s => s.state === 'missing');

  if (missingStickers.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">🎉</span>
        <p className="text-gray-500 mt-2">¡No tienes láminas faltantes!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        Te faltan <strong className="text-gray-900">{missingStickers.length}</strong> láminas
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {missingStickers.map((sticker) => (
          <StickerCard
            key={sticker.id}
            {...sticker}
            onClick={() => onStickerClick?.(sticker.id)}
          />
        ))}
      </div>
    </div>
  );
}
