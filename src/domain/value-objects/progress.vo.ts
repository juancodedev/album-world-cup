export class Progress {
  constructor(
    public readonly total: number,
    public readonly owned: number,
    public readonly duplicates: number,
  ) {
    Object.freeze(this);
  }

  get missing(): number {
    return Math.max(0, this.total - this.owned);
  }

  get percentage(): number {
    if (this.total === 0) return 0;
    return Math.round((this.owned / this.total) * 100);
  }

  get formattedPercentage(): string {
    return `${this.percentage}%`;
  }

  get isComplete(): boolean {
    return this.missing === 0;
  }

  equals(other: Progress): boolean {
    return (
      this.total === other.total &&
      this.owned === other.owned &&
      this.duplicates === other.duplicates
    );
  }
}
