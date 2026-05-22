import { IAccountMemberRepository } from '../../../domain/repositories/account-member.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { AccountMember } from '../../../domain/entities/account-member.entity';
import { NotFoundError } from '../../../domain/errors/domain.error';

export interface InviteMemberInput {
  accountId: string;
  invitedByUserId: string;
  email: string;
}

export class InviteMemberUseCase {
  constructor(
    private readonly accountMemberRepository: IAccountMemberRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: InviteMemberInput): Promise<AccountMember> {
    const user = await this.userRepository.getByEmail(input.email);
    if (!user) {
      throw new NotFoundError(`User with email ${input.email} not found`);
    }

    const existing = await this.accountMemberRepository.getByUserAndAccount(
      user.id,
      input.accountId,
    );
    if (existing) {
      throw new Error('User is already a member of this account');
    }

    const member = AccountMember.create(
      input.accountId,
      user.id,
      'member',
      input.invitedByUserId,
    );

    await this.accountMemberRepository.save(member);
    return member;
  }
}
