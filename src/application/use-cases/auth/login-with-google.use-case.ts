import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export class LoginWithGoogleUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(googleUser: GoogleUserInfo): Promise<User> {
    let user = await this.userRepository.getByAuthUid(googleUser.sub);

    if (!user) {
      user = await this.userRepository.getByEmail(googleUser.email);

      if (user) {
        // Link Google auth to existing email user
        const updated = new User({
          ...user,
          authProvider: 'google',
          authUid: googleUser.sub,
          avatarUrl: googleUser.picture,
          fullName: user.fullName || googleUser.name,
        });
        await this.userRepository.update(updated);
        return updated;
      }

      user = User.create({
        email: googleUser.email,
        fullName: googleUser.name,
        avatarUrl: googleUser.picture,
        authProvider: 'google',
        authUid: googleUser.sub,
      });
      await this.userRepository.save(user);
    }

    return user;
  }
}
