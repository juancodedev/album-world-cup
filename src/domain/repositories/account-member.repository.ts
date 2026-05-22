import { AccountMember } from '../entities/account-member.entity';

export interface IAccountMemberRepository {
  getById(id: string): Promise<AccountMember | null>;
  getByAccount(accountId: string): Promise<AccountMember[]>;
  getByUserAndAccount(userId: string, accountId: string): Promise<AccountMember | null>;
  getByUser(userId: string): Promise<AccountMember[]>;
  save(member: AccountMember): Promise<void>;
  update(member: AccountMember): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUserAndAccount(userId: string, accountId: string): Promise<void>;
}
