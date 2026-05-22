export type AccountRole = 'owner' | 'admin' | 'member';

export interface AccountMemberProps {
  id?: string;
  accountId: string;
  userId: string;
  role: AccountRole;
  invitedBy?: string;
  joinedAt?: Date;
  createdAt?: Date;
}

export class AccountMember {
  public readonly id: string;
  public readonly accountId: string;
  public readonly userId: string;
  public readonly role: AccountRole;
  public readonly invitedBy?: string;
  public readonly joinedAt: Date;
  public readonly createdAt: Date;

  constructor(props: AccountMemberProps) {
    this.id = props.id || crypto.randomUUID();
    this.accountId = props.accountId;
    this.userId = props.userId;
    this.role = props.role;
    this.invitedBy = props.invitedBy;
    this.joinedAt = props.joinedAt || new Date();
    this.createdAt = props.createdAt || new Date();
  }

  get isOwner(): boolean {
    return this.role === 'owner';
  }

  get isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'owner';
  }

  static create(accountId: string, userId: string, role: AccountRole = 'member', invitedBy?: string): AccountMember {
    return new AccountMember({ accountId, userId, role, invitedBy });
  }

  static createOwner(accountId: string, userId: string): AccountMember {
    return new AccountMember({ accountId, userId, role: 'owner' });
  }
}
