import { IAlbumRepository } from '../../../domain/repositories/album.repository';
import { AlbumDTO } from '../../dtos/album.dto';
import { albumMapper } from '../../mappers/album.mapper';

export class GetAllAlbumsUseCase {
  constructor(private readonly albumRepository: IAlbumRepository) {}

  async execute(): Promise<AlbumDTO[]> {
    const albums = await this.albumRepository.getActive();
    return albums.map(album => albumMapper.toDTO(album));
  }
}
