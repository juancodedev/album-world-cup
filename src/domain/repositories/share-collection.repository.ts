import { ShareCollection } from '../entities/share-collection.entity';

export interface IShareCollectionRepository {
  getByCode(code: string): Promise<ShareCollection | null>;
  getByAccount(accountId: string): Promise<ShareCollection | null>;
  save(share: ShareCollection): Promise<void>;
  update(share: ShareCollection): Promise<void>;
  delete(id: string): Promise<void>;
}
