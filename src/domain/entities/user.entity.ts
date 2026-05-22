export interface UserProps {
  id?: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  authProvider: 'google' | 'email';
  authUid: string;
  preferences?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly fullName?: string;
  public readonly avatarUrl?: string;
  public readonly authProvider: 'google' | 'email';
  public readonly authUid: string;
  public readonly preferences: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id || crypto.randomUUID();
    this.email = props.email;
    this.fullName = props.fullName;
    this.avatarUrl = props.avatarUrl;
    this.authProvider = props.authProvider;
    this.authUid = props.authUid;
    this.preferences = props.preferences || {};
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.deletedAt = props.deletedAt;
  }

  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
    return new User(props);
  }
}
