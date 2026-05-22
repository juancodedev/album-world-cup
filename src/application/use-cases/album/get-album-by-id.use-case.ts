import { IAlbumRepository } from '../../../domain/repositories/album.repository';
import { AlbumDTO } from '../../dtos/album.dto';
import { NotFoundError } from '../../../domain/errors/domain.error';
import { albumMapper } from '../../mappers/album.mapper';

export class GetAlbumByIdUseCase {
  constructor(private readonly albumRepository: IAlbumRepository) {}

  async execute(id: string): Promise<AlbumDTO> {
    const album = await this.albumRepository.getById(id);
    if (!album) throw new NotFoundError(`Album with ID ${id} not found`);
    return albumMapper.toDTO(album);
  }
}
