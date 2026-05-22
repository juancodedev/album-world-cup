export interface AccountProps {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly description?: string;
  public readonly avatarUrl?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AccountProps) {
    this.id = props.id || crypto.randomUUID();
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.avatarUrl = props.avatarUrl;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(props: Omit<AccountProps, 'id' | 'createdAt' | 'updatedAt'>): Account {
    return new Account(props);
  }
}
