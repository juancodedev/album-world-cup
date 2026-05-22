import { UserCollection } from '../entities/user-collection.entity';

export interface IUserCollectionRepository {
  getByUserAndSticker(userId: string, stickerId: string): Promise<UserCollection | null>;
  save(userCollection: UserCollection): Promise<void>;
  findByUser(userId: string): Promise<UserCollection[]>;
  findByUserAndAlbum(userId: string, albumId: string): Promise<UserCollection[]>;
  delete(id: string): Promise<void>;
  getCountByUser(userId: string): Promise<number>;
  getRecentByUser(userId: string, limit?: number): Promise<UserCollection[]>;
}
