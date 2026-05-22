import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { StickerDTO } from '../../dtos/sticker.dto';
import { stickerMapper } from '../../mappers/sticker.mapper';

export class GetAllStickersUseCase {
  constructor(private readonly stickerRepository: IStickerRepository) {}

  async execute(albumId: string): Promise<StickerDTO[]> {
    const stickers = await this.stickerRepository.getByAlbum(albumId);
    return stickers.map(sticker => stickerMapper.toDTO(sticker));
  }
}
