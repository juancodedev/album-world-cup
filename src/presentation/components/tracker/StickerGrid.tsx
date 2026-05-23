'use client';

import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { STICKERS_PER_TEAM } from '../../../shared/constants/tracker.constants';

interface StickerGridProps {
  teamCode: string;
  stickers: StickerDTO[];
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
}

export function StickerGrid({ teamCode, stickers, ownedSet, onToggle }: StickerGridProps) {
  const allNumbers = Array.from({ length: STICKERS_PER_TEAM }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
      {allNumbers.map(n => {
        const sticker = stickers.find(s => s.number % STICKERS_PER_TEAM === n % STICKERS_PER_TEAM || s.number === n);
        const owned = sticker ? ownedSet.has(sticker.id) : false;
        const code = `${teamCode}${n}`;

        return (
          <button
            key={n}
            onClick={() => sticker && onToggle(sticker.id)}
            className={`
              aspect-[3/4] rounded-lg text-[10px] font-bold transition-all duration-150
              flex flex-col items-center justify-center gap-0.5
              ${owned
                ? 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-md scale-105'
                : 'bg-gray-100 border border-dashed border-gray-300 text-gray-400 hover:bg-gray-200'
              }
              ${!sticker ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            `}
          >
            <span className={owned ? 'text-sm' : 'text-xs'}>{owned ? '✓' : n}</span>
            {!owned && <span className="text-[7px] opacity-40 font-mono">{code}</span>}
          </button>
        );
      })}
    </div>
  );
}
