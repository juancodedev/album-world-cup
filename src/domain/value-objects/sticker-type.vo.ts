export type StickerTypeValue = 'player' | 'team' | 'stadium' | 'emblem' | 'special' | 'action' | 'legend';

export class StickerType {
  private static readonly VALID_TYPES: StickerTypeValue[] = [
    'player', 'team', 'stadium', 'emblem', 'special', 'action', 'legend',
  ];

  private constructor(public readonly value: StickerTypeValue) {
    Object.freeze(this);
  }

  static create(value: string): StickerType {
    if (!this.VALID_TYPES.includes(value as StickerTypeValue)) {
      throw new Error(`Invalid sticker type: ${value}`);
    }
    return new StickerType(value as StickerTypeValue);
  }

  get label(): string {
    const labels: Record<StickerTypeValue, string> = {
      player: 'Jugador',
      team: 'Selección',
      stadium: 'Estadio',
      emblem: 'Escudo',
      special: 'Especial',
      action: 'Acción',
      legend: 'Leyenda',
    };
    return labels[this.value];
  }

  equals(other: StickerType): boolean {
    return this.value === other.value;
  }
}
