export type RarityValue = 'common' | 'rare' | 'legendary' | 'holographic' | 'limited';

export class Rarity {
  private static readonly VALID_RARITIES: RarityValue[] = [
    'common', 'rare', 'legendary', 'holographic', 'limited',
  ];

  private constructor(public readonly value: RarityValue) {
    Object.freeze(this);
  }

  static create(value: string): Rarity {
    if (!this.VALID_RARITIES.includes(value as RarityValue)) {
      throw new Error(`Invalid rarity: ${value}`);
    }
    return new Rarity(value as RarityValue);
  }

  get label(): string {
    const labels: Record<RarityValue, string> = {
      common: 'Común',
      rare: 'Rara',
      legendary: 'Legendaria',
      holographic: 'Holográfica',
      limited: 'Edición Limitada',
    };
    return labels[this.value];
  }

  get color(): string {
    const colors: Record<RarityValue, string> = {
      common: '#8b8b8b',
      rare: '#4f46e5',
      legendary: '#f59e0b',
      holographic: '#ec4899',
      limited: '#8b5cf6',
    };
    return colors[this.value];
  }

  equals(other: Rarity): boolean {
    return this.value === other.value;
  }
}
