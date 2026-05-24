'use client';

import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { StickerCard } from '../stickers/StickerCard';
import Link from 'next/link';

interface RecentStickersProps {
  stickers: StickerDTO[];
  onStickerClick?: (id: string) => void;
}

export function RecentStickers({ stickers, onStickerClick }: RecentStickersProps) {
  const recent = stickers.slice(0, 6);

  if (recent.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Últimas agregadas</h3>
        <Link href="/collection" className="text-xs text-blue-600 font-medium">
          Ver todas
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {recent.map((sticker) => (
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
