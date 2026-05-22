import { User } from '../entities/user.entity';

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByAuthUid(authUid: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  softDelete(id: string): Promise<void>;
}
