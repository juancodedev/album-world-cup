export const RARITY = {
  common: { label: 'Común', color: '#8b8b8b', bgColor: 'bg-gray-500' },
  rare: { label: 'Rara', color: '#4f46e5', bgColor: 'bg-indigo-600' },
  legendary: { label: 'Legendaria', color: '#f59e0b', bgColor: 'bg-amber-500' },
  holographic: { label: 'Holográfica', color: '#ec4899', bgColor: 'bg-pink-500' },
  limited: { label: 'Edición Limitada', color: '#8b5cf6', bgColor: 'bg-purple-600' },
} as const;

export type Rarity = keyof typeof RARITY;
