import { IStickerRepository, StickerFilters } from '../../../domain/repositories/sticker.repository';
import { StickerDTO } from '../../dtos/sticker.dto';
import { stickerMapper } from '../../mappers/sticker.mapper';

export class SearchStickersUseCase {
  constructor(private readonly stickerRepository: IStickerRepository) {}

  async execute(filters: StickerFilters): Promise<StickerDTO[]> {
    const stickers = await this.stickerRepository.getAll(filters);
    return stickers.map(sticker => stickerMapper.toDTO(sticker));
  }
}
