import { Sticker } from '../entities/sticker.entity';

export interface StickerFilters {
  albumId?: string;
  teamId?: string;
  rarity?: string;
  isSpecial?: boolean;
  search?: string;
  stickerTypeId?: string;
}

export interface IStickerRepository {
  getById(id: string): Promise<Sticker | null>;
  getAll(filters?: StickerFilters): Promise<Sticker[]>;
  getByAlbum(albumId: string): Promise<Sticker[]>;
  getByTeam(teamId: string): Promise<Sticker[]>;
  getByNumber(albumId: string, number: number): Promise<Sticker | null>;
  search(query: string, albumId?: string): Promise<Sticker[]>;
  save(sticker: Sticker): Promise<void>;
  saveMany(stickers: Sticker[]): Promise<void>;
}
