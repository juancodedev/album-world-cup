import { User } from '../../src/domain/entities/user.entity';

export const createUserFixture = (overrides: Partial<{
  email: string;
  fullName: string;
  authProvider: 'google' | 'email';
  authUid: string;
}> = {}): User => {
  return User.create({
    email: 'test@example.com',
    fullName: 'Test User',
    authProvider: 'email',
    authUid: 'auth-uid-123',
    ...overrides,
  });
};
