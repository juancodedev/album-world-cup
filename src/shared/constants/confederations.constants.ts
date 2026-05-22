export const CONFEDERATIONS = {
  CONMEBOL: { code: 'CONMEBOL', name: 'Sudamérica', region: 'América del Sur', color: '#10b981' },
  UEFA: { code: 'UEFA', name: 'Europa', region: 'Europa', color: '#3b82f6' },
  CONCACAF: { code: 'CONCACAF', name: 'Norteamérica', region: 'Norteamérica', color: '#f59e0b' },
  CAF: { code: 'CAF', name: 'África', region: 'África', color: '#ef4444' },
  AFC: { code: 'AFC', name: 'Asia', region: 'Asia', color: '#8b5cf6' },
  OFC: { code: 'OFC', name: 'Oceanía', region: 'Oceanía', color: '#06b6d4' },
} as const;

export type ConfederationCode = keyof typeof CONFEDERATIONS;
