import { AccountMember } from '../../../../src/domain/entities/account-member.entity';

describe('AccountMember', () => {
  describe('create', () => {
    it('should create a member with default role', () => {
      const member = AccountMember.create('account-1', 'user-1');

      expect(member.accountId).toBe('account-1');
      expect(member.userId).toBe('user-1');
      expect(member.role).toBe('member');
      expect(member.isOwner).toBe(false);
      expect(member.isAdmin).toBe(false);
    });

    it('should create an owner', () => {
      const owner = AccountMember.createOwner('account-1', 'user-1');

      expect(owner.role).toBe('owner');
      expect(owner.isOwner).toBe(true);
      expect(owner.isAdmin).toBe(true);
    });

    it('should create member with specific role', () => {
      const admin = AccountMember.create('account-1', 'user-2', 'admin', 'user-1');

      expect(admin.role).toBe('admin');
      expect(admin.isAdmin).toBe(true);
      expect(admin.invitedBy).toBe('user-1');
    });
  });

  describe('isAdmin', () => {
    it('should return true for owner', () => {
      expect(AccountMember.createOwner('a', 'u').isAdmin).toBe(true);
    });

    it('should return true for admin', () => {
      expect(AccountMember.create('a', 'u', 'admin').isAdmin).toBe(true);
    });

    it('should return false for member', () => {
      expect(AccountMember.create('a', 'u', 'member').isAdmin).toBe(false);
    });
  });
});
