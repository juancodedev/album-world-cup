export class ShareCode {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): ShareCode {
    const cleaned = value.trim().toUpperCase();
    if (!/^[A-Z0-9]{8,12}$/.test(cleaned)) {
      throw new Error('Invalid share code format');
    }
    return new ShareCode(cleaned);
  }

  static generate(): ShareCode {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return new ShareCode(code);
  }

  equals(other: ShareCode): boolean {
    return this.value === other.value;
  }
}
