export const GROUP_COLORS: Record<string, string> = {
  A: '#e63946',
  B: '#2196f3',
  C: '#4caf50',
  D: '#ff9800',
  E: '#9c27b0',
  F: '#00bcd4',
  G: '#f06292',
  H: '#8bc34a',
  I: '#ff5722',
  J: '#3f51b5',
  K: '#009688',
  L: '#ffc107',
};

export const GROUP_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const SPECIAL_SECTIONS = [
  { code: 'FWC', name: 'Sección Especial / Introducción', count: 20, icon: '🌎', startPosition: 0 },
  { code: 'MUS', name: 'FIFA Museum', count: 11, icon: '🏆' },
  { code: 'COC', name: 'Coca-Cola Exclusivos', count: 14, icon: '🥤' },
] as const;

export const STICKERS_PER_TEAM = 20;
export const TOTAL_STICKERS = 1005;
