import { StickerDuplicate } from '../entities/sticker-duplicate.entity';

export interface IStickerDuplicateRepository {
  getByUserAndSticker(userId: string, stickerId: string): Promise<StickerDuplicate | null>;
  save(duplicate: StickerDuplicate): Promise<void>;
  findByUser(userId: string): Promise<StickerDuplicate[]>;
  delete(id: string): Promise<void>;
  getTotalByUser(userId: string): Promise<number>;
}
