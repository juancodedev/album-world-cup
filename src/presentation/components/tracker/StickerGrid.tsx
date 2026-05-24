'use client';

import { useRef, useState } from 'react';
import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { STICKERS_PER_TEAM } from '../../../shared/constants/tracker.constants';

interface StickerGridProps {
  teamCode: string;
  stickers: StickerDTO[];
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
  onDuplicate?: (stickerId: string) => void;
}

export function StickerGrid({ teamCode, stickers, ownedSet, onToggle, onDuplicate }: StickerGridProps) {
  const allNumbers = Array.from({ length: STICKERS_PER_TEAM }, (_, i) => i + 1);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (stickerId: string) => {
    if (!onDuplicate) {
      onToggle(stickerId);
      return;
    }
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDuplicate(stickerId);
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onToggle(stickerId);
      }, 250);
    }
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
      {allNumbers.map(n => {
        const sticker = stickers.find(s => s.number % STICKERS_PER_TEAM === n % STICKERS_PER_TEAM || s.number === n);
        const owned = sticker ? ownedSet.has(sticker.id) : false;
        const dupCount = sticker?.duplicateCount || 0;
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
              onClick={() => sticker && handleClick(sticker.id)}
              className="absolute inset-0 w-full h-full z-10"
              aria-label={owned ? `Desmarcar sticker #${n}` : `Marcar sticker #${n}`}
            />

            {sticker && sticker.imageUrl ? (
              <Thumbnail
                src={sticker.imageThumbnail || sticker.imageUrl}
                alt={code}
                owned={owned}
                dupCount={dupCount}
              />
            ) : sticker ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-0.5 sm:p-1 gap-0.5">
                <span className={`font-bold leading-tight text-center break-all px-0.5 ${
                  owned
                    ? 'text-green-700 text-[10px] sm:text-sm'
                    : 'text-gray-400 text-[9px] sm:text-xs'
                }`}>
                  {code}
                </span>
                {dupCount > 0 && (
                  <div className="bg-blue-500 text-white text-[7px] sm:text-[8px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold shadow-md">
                    {dupCount}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-0.5">
                <span className="text-[7px] sm:text-[8px] text-gray-300 font-mono text-center leading-tight">{code}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Thumbnail({ src, alt, owned, dupCount }: { src: string; alt: string; owned: boolean; dupCount?: number }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-0.5 sm:p-1 gap-0.5">
        <span className={`font-bold leading-tight text-center break-all px-0.5 ${
          owned
            ? 'text-green-700 text-[10px] sm:text-sm'
            : 'text-gray-400 text-[9px] sm:text-xs'
        }`}>
          {alt.replace('#', '')}
        </span>
        {(dupCount ?? 0) > 0 && (
          <div className="bg-blue-500 text-white text-[7px] sm:text-[8px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold shadow-md">
            {dupCount}
          </div>
        )}
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
