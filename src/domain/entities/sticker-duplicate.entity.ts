export interface StickerDuplicateProps {
  id?: string;
  userId: string;
  stickerId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class StickerDuplicate {
  public readonly id: string;
  public readonly userId: string;
  public readonly stickerId: string;
  public quantity: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: StickerDuplicateProps) {
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.stickerId = props.stickerId;
    this.quantity = props.quantity;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(userId: string, stickerId: string, quantity = 1): StickerDuplicate {
    return new StickerDuplicate({ userId, stickerId, quantity });
  }

  increment(amount = 1): void {
    this.quantity += amount;
    this.updatedAt = new Date();
  }

  decrement(amount = 1): void {
    if (this.quantity - amount < 0) {
      throw new Error('Cannot have negative duplicates');
    }
    this.quantity -= amount;
    this.updatedAt = new Date();
  }
}
