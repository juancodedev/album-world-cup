import { LoginWithGoogleUseCase } from '../use-cases/auth/login-with-google.use-case';
import { LogoutUseCase } from '../use-cases/auth/logout.use-case';
import { User } from '../../domain/entities/user.entity';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export class AuthService {
  constructor(
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async loginWithGoogle(googleUser: GoogleUserInfo): Promise<User> {
    return this.loginWithGoogleUseCase.execute(googleUser);
  }

  async logout(): Promise<void> {
    return this.logoutUseCase.execute();
  }
}
