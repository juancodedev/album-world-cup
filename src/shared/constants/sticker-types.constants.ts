export const STICKER_TYPES = {
  player: { code: 'player', name: 'Jugador', description: 'Lámina de jugador' },
  team: { code: 'team', name: 'Selección', description: 'Lámina de selección' },
  stadium: { code: 'stadium', name: 'Estadio', description: 'Lámina de estadio' },
  emblem: { code: 'emblem', name: 'Escudo', description: 'Lámina de escudo' },
  special: { code: 'special', name: 'Especial', description: 'Lámina especial' },
  action: { code: 'action', name: 'Acción', description: 'Lámina de acción' },
  legend: { code: 'legend', name: 'Leyenda', description: 'Lámina de leyenda' },
} as const;

export type StickerType = keyof typeof STICKER_TYPES;
