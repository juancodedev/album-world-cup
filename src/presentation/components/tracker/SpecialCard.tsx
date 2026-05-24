'use client';

import { useState } from 'react';
import { SpecialData } from '../../hooks/useTracker';
import { StickerGrid } from './StickerGrid';
import { Progress } from '../../../components/ui/progress';

interface SpecialCardProps {
  section: SpecialData;
  ownedSet: Set<string>;
  onToggle: (stickerId: string) => void;
  onDuplicate?: (stickerId: string) => void;
}

export function SpecialCard({ section, ownedSet, onToggle, onDuplicate }: SpecialCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pct = section.count > 0 ? Math.round((section.ownedCount / section.count) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-2xl sm:text-3xl flex-shrink-0">{section.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs sm:text-sm text-amber-700 truncate mr-2">{section.name}</span>
            <span className="text-[11px] sm:text-xs font-bold flex-shrink-0" style={{ color: pct === 100 ? '#16a34a' : '#d97706' }}>
              {section.ownedCount}/{section.count}
            </span>
          </div>
          <Progress value={pct} className="h-1 sm:h-1.5" />
        </div>
        <span
          className="text-gray-400 text-sm transition-transform duration-200 flex-shrink-0"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="pt-3">
            <StickerGrid
              teamCode={section.code}
              stickers={section.stickers}
              ownedSet={ownedSet}
              onToggle={onToggle}
              onDuplicate={onDuplicate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
