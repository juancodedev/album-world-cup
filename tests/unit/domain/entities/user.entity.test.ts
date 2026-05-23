import { User } from '../../../../src/domain/entities/user.entity';

describe('User', () => {
  describe('create', () => {
    it('should create a user with google auth', () => {
      const user = User.create({
        email: 'test@example.com',
        fullName: 'Test User',
        authProvider: 'google',
        authUid: 'google-123',
      });

      expect(user.email).toBe('test@example.com');
      expect(user.fullName).toBe('Test User');
      expect(user.authProvider).toBe('google');
      expect(user.authUid).toBe('google-123');
      expect(user.isDeleted).toBe(false);
      expect(user.preferences).toEqual({});
    });

    it('should create a user with email auth', () => {
      const user = User.create({
        email: 'test@example.com',
        authProvider: 'email',
        authUid: 'email-456',
      });

      expect(user.authProvider).toBe('email');
      expect(user.fullName).toBeUndefined();
    });
  });

  describe('isDeleted', () => {
    it('should return true when deletedAt is set', () => {
      const user = new User({
        email: 'deleted@example.com',
        authProvider: 'email',
        authUid: 'deleted-uid',
        deletedAt: new Date(),
      });

      expect(user.isDeleted).toBe(true);
    });

    it('should return false when deletedAt is not set', () => {
      const user = User.create({
        email: 'active@example.com',
        authProvider: 'email',
        authUid: 'active-uid',
      });

      expect(user.isDeleted).toBe(false);
    });
  });

  describe('avatarUrl', () => {
    it('should store avatar URL when provided', () => {
      const user = User.create({
        email: 'avatar@example.com',
        authProvider: 'google',
        authUid: 'avatar-uid',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(user.avatarUrl).toBe('https://example.com/avatar.png');
    });
  });
});
