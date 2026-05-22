export type ConfederationValue = 'CONMEBOL' | 'UEFA' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';

export class Confederation {
  private static readonly VALID_CONFEDERATIONS: ConfederationValue[] = [
    'CONMEBOL', 'UEFA', 'CONCACAF', 'CAF', 'AFC', 'OFC',
  ];

  private constructor(public readonly value: ConfederationValue) {
    Object.freeze(this);
  }

  static create(value: string): Confederation {
    if (!this.VALID_CONFEDERATIONS.includes(value as ConfederationValue)) {
      throw new Error(`Invalid confederation: ${value}`);
    }
    return new Confederation(value as ConfederationValue);
  }

  get name(): string {
    const names: Record<ConfederationValue, string> = {
      CONMEBOL: 'Sudamérica',
      UEFA: 'Europa',
      CONCACAF: 'Norteamérica',
      CAF: 'África',
      AFC: 'Asia',
      OFC: 'Oceanía',
    };
    return names[this.value];
  }

  get color(): string {
    const colors: Record<ConfederationValue, string> = {
      CONMEBOL: '#10b981',
      UEFA: '#3b82f6',
      CONCACAF: '#f59e0b',
      CAF: '#ef4444',
      AFC: '#8b5cf6',
      OFC: '#06b6d4',
    };
    return colors[this.value];
  }

  equals(other: Confederation): boolean {
    return this.value === other.value;
  }
}
