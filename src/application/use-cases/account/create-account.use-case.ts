import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { IAccountMemberRepository } from '../../../domain/repositories/account-member.repository';
import { Account } from '../../../domain/entities/account.entity';
import { AccountMember } from '../../../domain/entities/account-member.entity';

export interface CreateAccountInput {
  name: string;
  userId: string;
  description?: string;
}

export class CreateAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly accountMemberRepository: IAccountMemberRepository,
  ) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const account = Account.create({
      name: input.name,
      slug,
      description: input.description,
    });

    await this.accountRepository.save(account);

    const owner = AccountMember.createOwner(account.id, input.userId);
    await this.accountMemberRepository.save(owner);

    return account;
  }
}
