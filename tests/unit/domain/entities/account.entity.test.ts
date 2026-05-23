import { Account } from '../../../../src/domain/entities/account.entity';

describe('Account', () => {
  describe('create', () => {
    it('should create an account', () => {
      const account = Account.create({
        name: 'My Collection',
        slug: 'my-collection',
      });

      expect(account.name).toBe('My Collection');
      expect(account.slug).toBe('my-collection');
      expect(account.id).toBeDefined();
      expect(account.createdAt).toBeInstanceOf(Date);
    });

    it('should create account with all optional props', () => {
      const account = Account.create({
        name: 'Family Album',
        slug: 'family-album',
        description: 'Compartido con la familia',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(account.description).toBe('Compartido con la familia');
      expect(account.avatarUrl).toBe('https://example.com/avatar.png');
    });
  });
});
