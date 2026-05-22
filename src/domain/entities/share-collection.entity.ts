export interface ShareCollectionProps {
  id?: string;
  accountId: string;
  userId: string;
  shareCode: string;
  isPublic: boolean;
  showDuplicates: boolean;
  showMissing: boolean;
  expiresAt?: Date;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ShareCollection {
  public readonly id: string;
  public readonly accountId: string;
  public readonly userId: string;
  public readonly shareCode: string;
  public isPublic: boolean;
  public showDuplicates: boolean;
  public showMissing: boolean;
  public readonly expiresAt?: Date;
  public viewCount: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ShareCollectionProps) {
    this.id = props.id || crypto.randomUUID();
    this.accountId = props.accountId;
    this.userId = props.userId;
    this.shareCode = props.shareCode;
    this.isPublic = props.isPublic;
    this.showDuplicates = props.showDuplicates;
    this.showMissing = props.showMissing;
    this.expiresAt = props.expiresAt;
    this.viewCount = props.viewCount;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  incrementViewCount(): void {
    this.viewCount += 1;
    this.updatedAt = new Date();
  }

  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  static create(accountId: string, userId: string, code: string): ShareCollection {
    return new ShareCollection({
      accountId,
      userId,
      shareCode: code,
      isPublic: true,
      showDuplicates: true,
      showMissing: true,
      viewCount: 0,
    });
  }
}
