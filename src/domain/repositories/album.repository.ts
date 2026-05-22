import { Album } from '../entities/album.entity';

export interface IAlbumRepository {
  getById(id: string): Promise<Album | null>;
  getAll(): Promise<Album[]>;
  getActive(): Promise<Album[]>;
  save(album: Album): Promise<void>;
  update(album: Album): Promise<void>;
  delete(id: string): Promise<void>;
}
