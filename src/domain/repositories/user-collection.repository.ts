import { UserCollection } from '../entities/user-collection.entity';

export interface IUserCollectionRepository {
  getByUserAndSticker(accountId: string, userId: string, stickerId: string): Promise<UserCollection | null>;
  save(userCollection: UserCollection): Promise<void>;
  findByAccount(accountId: string): Promise<UserCollection[]>;
  findByAccountAndAlbum(accountId: string, albumId: string): Promise<UserCollection[]>;
  findByUser(accountId: string, userId: string): Promise<UserCollection[]>;
  delete(id: string): Promise<void>;
  getCountByAccount(accountId: string): Promise<number>;
  getRecentByAccount(accountId: string, limit?: number): Promise<UserCollection[]>;
}
