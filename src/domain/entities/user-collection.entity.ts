export interface UserCollectionProps {
  id?: string;
  userId: string;
  stickerId: string;
  quantityOwned: number;
  obtainedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserCollection {
  public readonly id: string;
  public readonly userId: string;
  public readonly stickerId: string;
  public quantityOwned: number;
  public readonly obtainedAt: Date;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserCollectionProps) {
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.stickerId = props.stickerId;
    this.quantityOwned = props.quantityOwned;
    this.obtainedAt = props.obtainedAt || new Date();
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(userId: string, stickerId: string): UserCollection {
    return new UserCollection({
      userId,
      stickerId,
      quantityOwned: 1,
    });
  }

  incrementQuantity(): void {
    this.quantityOwned += 1;
    this.updatedAt = new Date();
  }

  decrementQuantity(): void {
    if (this.quantityOwned <= 1) {
      throw new Error('Cannot decrement below 1');
    }
    this.quantityOwned -= 1;
    this.updatedAt = new Date();
  }
}
