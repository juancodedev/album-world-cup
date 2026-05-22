import { StickerDuplicate } from '../entities/sticker-duplicate.entity';

export interface IStickerDuplicateRepository {
  getByUserAndSticker(accountId: string, userId: string, stickerId: string): Promise<StickerDuplicate | null>;
  save(duplicate: StickerDuplicate): Promise<void>;
  findByAccount(accountId: string): Promise<StickerDuplicate[]>;
  findByUser(accountId: string, userId: string): Promise<StickerDuplicate[]>;
  delete(id: string): Promise<void>;
  getTotalByAccount(accountId: string): Promise<number>;
}
