import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { IAccountMemberRepository } from '../../../domain/repositories/account-member.repository';
import { Account } from '../../../domain/entities/account.entity';

export class GetUserAccountsUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly accountMemberRepository: IAccountMemberRepository,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return this.accountRepository.getByUser(userId);
  }
}
