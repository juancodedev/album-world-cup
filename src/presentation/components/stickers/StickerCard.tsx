'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RareStickerBadge } from './RareStickerBadge';

interface StickerCardProps {
  id: string;
  number: number;
  playerName: string | null;
  teamName: string | null;
  teamFlag: string | null;
  imageUrl: string;
  rarity: string;
  state: 'missing' | 'obtained' | 'duplicate';
  duplicateCount?: number;
  isSpecial?: boolean;
  onClick?: () => void;
  onAddClick?: () => void;
  onDeleteClick?: () => void;
  variant?: 'grid' | 'list';
}

export function StickerCard({
  id,
  number,
  playerName,
  teamName,
  teamFlag,
  imageUrl,
  rarity,
  state,
  duplicateCount = 0,
  isSpecial = false,
  onClick,
  onAddClick,
  onDeleteClick,
  variant = 'grid',
}: StickerCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const stateStyles = {
    missing: 'border-gray-200 opacity-80',
    obtained: 'border-green-400 bg-green-50/30',
    duplicate: 'border-blue-400 bg-blue-50/30',
  };

  const stateIcons = {
    missing: '✗',
    obtained: '✓',
    duplicate: '🔄',
  };

  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 ${stateStyles[state]} hover:shadow-md transition-all cursor-pointer`}
      >
        <div className="relative w-12 h-16 shrink-0">
          <Image
            src={imageUrl}
            alt={`#${number}`}
            fill
            className="object-cover rounded"
            onLoadingComplete={() => setImageLoading(false)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-500">#{number}</span>
            {isSpecial && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Especial</span>}
          </div>
          <p className="font-semibold text-sm text-gray-900 truncate">{playerName || '—'}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {teamFlag && <span className="text-sm">{teamFlag}</span>}
            <span className="text-xs text-gray-500 truncate">{teamName}</span>
          </div>
          <RareStickerBadge rarity={rarity} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">{stateIcons[state]}</span>
          {duplicateCount > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              +{duplicateCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transform transition-all duration-200 hover:-translate-y-1"
    >
      <div
        className={`relative overflow-hidden rounded-xl border-2 ${stateStyles[state]} bg-white shadow-sm hover:shadow-lg transition-shadow`}
      >
        <div className="aspect-[63/88] relative">
          <Image
            src={imageUrl}
            alt={`Sticker #${number}`}
            fill
            className="object-cover"
            onLoadingComplete={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
          )}

          {/* Rarity indicator line */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              backgroundColor: {
                common: '#8b8b8b',
                rare: '#4f46e5',
                legendary: '#f59e0b',
                holographic: '#ec4899',
                limited: '#8b5cf6',
              }[rarity] || '#8b8b8b',
            }}
          />

          {/* Special badge */}
          {isSpecial && (
            <div className="absolute top-1.5 left-1.5">
              <span className="text-[8px] bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow">
                ★
              </span>
            </div>
          )}

          {/* Number badge */}
          <div className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            #{number}
          </div>

          {/* State overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {teamFlag && <span className="text-sm">{teamFlag}</span>}
              </div>
              <div className="bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {stateIcons[state]}
              </div>
            </div>
          </div>
        </div>

        <div className="p-1.5 text-center">
          <p className="text-[11px] font-semibold text-gray-800 truncate">{playerName || '—'}</p>
          {duplicateCount > 0 && (
            <span className="text-[9px] text-blue-600 font-medium">
              +{duplicateCount} repetida{duplicateCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
