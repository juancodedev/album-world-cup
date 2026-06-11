export type ExchangeOfferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface ExchangeOfferProps {
  id?: string;
  fromUserId: string;
  fromAccountId: string;
  offeredStickerId: string;
  requestedStickerId?: string;
  status?: ExchangeOfferStatus;
  acceptedBy?: string;
  acceptedAccountId?: string;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExchangeOffer {
  public readonly id: string;
  public readonly fromUserId: string;
  public readonly fromAccountId: string;
  public readonly offeredStickerId: string;
  public readonly requestedStickerId?: string;
  public status: ExchangeOfferStatus;
  public acceptedBy?: string;
  public acceptedAccountId?: string;
  public readonly message?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ExchangeOfferProps) {
    this.id = props.id || crypto.randomUUID();
    this.fromUserId = props.fromUserId;
    this.fromAccountId = props.fromAccountId;
    this.offeredStickerId = props.offeredStickerId;
    this.requestedStickerId = props.requestedStickerId;
    this.status = props.status || 'pending';
    this.acceptedBy = props.acceptedBy;
    this.acceptedAccountId = props.acceptedAccountId;
    this.message = props.message;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(props: Omit<ExchangeOfferProps, 'id' | 'createdAt' | 'updatedAt'>): ExchangeOffer {
    return new ExchangeOffer(props);
  }

  accept(acceptedByUserId: string, acceptedAccountId: string): void {
    if (this.status !== 'pending') {
      throw new Error('Cannot accept an offer that is not pending');
    }
    if (this.fromUserId === acceptedByUserId) {
      throw new Error('Cannot accept your own offer');
    }
    this.acceptedBy = acceptedByUserId;
    this.acceptedAccountId = acceptedAccountId;
    this.status = 'accepted';
    this.updatedAt = new Date();
  }

  complete(): void {
    if (this.status !== 'accepted') {
      throw new Error('Can only complete an accepted offer');
    }
    this.status = 'completed';
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status === 'completed') {
      throw new Error('Cannot cancel a completed offer');
    }
    if (this.status === 'cancelled') {
      return;
    }
    this.status = 'cancelled';
    this.updatedAt = new Date();
  }

  reject(): void {
    if (this.status !== 'pending') {
      throw new Error('Can only reject a pending offer');
    }
    this.status = 'rejected';
    this.updatedAt = new Date();
  }

  get isBilateral(): boolean {
    return !!this.requestedStickerId;
  }
}
