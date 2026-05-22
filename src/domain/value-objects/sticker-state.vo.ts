export type StickerStateValue = 'missing' | 'obtained' | 'duplicate';

export class StickerState {
  private constructor(public readonly value: StickerStateValue) {
    Object.freeze(this);
  }

  static readonly MISSING = new StickerState('missing');
  static readonly OBTAINED = new StickerState('obtained');
  static readonly DUPLICATE = new StickerState('duplicate');

  static from(owned: boolean, duplicates: number): StickerState {
    if (duplicates > 0) return StickerState.DUPLICATE;
    if (owned) return StickerState.OBTAINED;
    return StickerState.MISSING;
  }

  get label(): string {
    const labels: Record<StickerStateValue, string> = {
      missing: 'Faltante',
      obtained: 'Obtenida',
      duplicate: 'Repetida',
    };
    return labels[this.value];
  }

  get icon(): string {
    const icons: Record<StickerStateValue, string> = {
      missing: '✗',
      obtained: '✓',
      duplicate: '🔄',
    };
    return icons[this.value];
  }

  get borderColor(): string {
    const colors: Record<StickerStateValue, string> = {
      missing: 'border-gray-300',
      obtained: 'border-green-500',
      duplicate: 'border-blue-500',
    };
    return colors[this.value];
  }

  equals(other: StickerState): boolean {
    return this.value === other.value;
  }
}
