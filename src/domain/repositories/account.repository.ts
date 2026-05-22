import { Account } from '../entities/account.entity';

export interface IAccountRepository {
  getById(id: string): Promise<Account | null>;
  getBySlug(slug: string): Promise<Account | null>;
  getByUser(userId: string): Promise<Account[]>;
  save(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
  delete(id: string): Promise<void>;
}
