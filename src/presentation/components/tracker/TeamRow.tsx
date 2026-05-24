'use client';

import { useState } from 'react';
import { StickerDTO } from '../../../application/dtos/sticker.dto';
import { StickerGrid } from './StickerGrid';
import { Progress } from '../../../components/ui/progress';
import { STICKERS_PER_TEAM } from '../../../shared/constants/tracker.constants';

interface TeamRowProps {
  code: string;
  name: string;
  flag: string | null;
  stickers: StickerDTO[];
  ownedCount: number;
  groupColor: string;
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
  onMarkAll: () => void;
  onClearAll: () => void;
}

export function TeamRow({
  code,
  name,
  flag,
  stickers,
  ownedCount,
  groupColor,
  ownedSet,
  onToggle,
  onMarkAll,
  onClearAll,
}: TeamRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isComplete = ownedCount === STICKERS_PER_TEAM;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{ borderColor: isComplete ? groupColor : 'rgba(0,0,0,0.07)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 sm:gap-3 p-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-xl sm:text-2xl flex-shrink-0">{flag || '🏳️'}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-semibold text-sm text-gray-900 truncate">{name}</span>
            {isComplete && <span className="text-[10px] sm:text-xs flex-shrink-0">🏅</span>}
          </div>
          <Progress
            value={(ownedCount / STICKERS_PER_TEAM) * 100}
            className="h-1 sm:h-1.5"
            style={{ backgroundColor: `${groupColor}20` }}
          />
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono truncate min-w-0 mr-1">{code}1–{code}{STICKERS_PER_TEAM}</span>
            <span className="text-[9px] sm:text-[10px] font-bold flex-shrink-0" style={{ color: groupColor }}>
              {ownedCount}/{STICKERS_PER_TEAM}
            </span>
          </div>
        </div>

        <span
          className="text-gray-400 text-sm transition-transform duration-200 flex-shrink-0 ml-1"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="pt-3">
            <StickerGrid
              teamCode={code}
              stickers={stickers}
              ownedSet={ownedSet}
              onToggle={onToggle}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onMarkAll}
              className="flex-1 py-2.5 sm:py-1.5 rounded-lg text-xs font-bold text-white transition-colors hover:opacity-90 min-h-[36px]"
              style={{ backgroundColor: groupColor }}
            >
              ✓ Marcar todas
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 py-2.5 sm:py-1.5 rounded-lg text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors min-h-[36px]"
            >
              ✗ Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
