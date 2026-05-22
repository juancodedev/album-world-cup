'use client';

import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { StickerCard } from '../stickers/StickerCard';
import { Progress } from '../../../components/ui/progress';

interface TeamSectionProps {
  teamName: string;
  teamFlag: string | null;
  stickers: StickerDTO[];
  totalStickers: number;
  onStickerClick?: (id: string) => void;
}

export function TeamSection({
  teamName,
  teamFlag,
  stickers,
  totalStickers,
  onStickerClick,
}: TeamSectionProps) {
  const owned = stickers.filter(s => s.state !== 'missing').length;
  const percentage = totalStickers > 0 ? Math.round((owned / totalStickers) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{teamFlag || '🏳️'}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{teamName}</h3>
          <div className="flex items-center gap-2">
            <Progress value={percentage} className="h-1.5 flex-1" />
            <span className="text-xs text-gray-500 font-medium">
              {owned}/{totalStickers}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {stickers.map((sticker) => (
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
