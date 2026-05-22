import { RARITY, Rarity } from '../../../shared/constants/rarity.constants';

interface RareStickerBadgeProps {
  rarity: string;
  size?: 'sm' | 'md';
}

export function RareStickerBadge({ rarity, size = 'sm' }: RareStickerBadgeProps) {
  const config = RARITY[rarity as Rarity];
  if (!config) return null;

  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
