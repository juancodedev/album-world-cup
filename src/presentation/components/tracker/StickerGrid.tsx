'use client';

import { useState } from 'react';
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
          <div
            key={n}
            className={`
              aspect-[3/4] rounded-lg transition-all duration-150 relative overflow-hidden
              ${owned
                ? 'ring-2 ring-green-500 ring-offset-1 bg-gradient-to-b from-green-50 to-green-100'
                : 'bg-gray-100 border border-dashed border-gray-300 hover:bg-gray-200'
              }
              ${!sticker ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            `}
          >
            <button
              onClick={() => sticker && onToggle(sticker.id)}
              className="absolute inset-0 w-full h-full z-10"
              aria-label={owned ? `Desmarcar sticker #${n}` : `Marcar sticker #${n}`}
            />

            {sticker && sticker.imageUrl ? (
              <Thumbnail
                src={sticker.imageThumbnail || sticker.imageUrl}
                alt={`#${n}`}
                owned={owned}
              />
            ) : sticker ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-1">
                <span className={`font-bold leading-none ${owned ? 'text-green-700 text-sm' : 'text-gray-400 text-xs'}`}>
                  {owned ? '✓' : n}
                </span>
                {!owned && <span className="text-[7px] text-gray-300 font-mono mt-0.5">{code}</span>}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] text-gray-300 font-mono">{code}</span>
              </div>
            )}

            {owned && (
              <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[7px] font-bold text-center py-0.5 leading-none">
                ✓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Thumbnail({ src, alt, owned }: { src: string; alt: string; owned: boolean }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1">
        <span className={`font-bold leading-none ${owned ? 'text-green-700 text-sm' : 'text-gray-400 text-xs'}`}>
          {owned ? '✓' : alt.replace('#', '')}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
