import { IShareCollectionRepository } from '../../../domain/repositories/share-collection.repository';
import { ShareCollection } from '../../../domain/entities/share-collection.entity';
import { ShareCode } from '../../../domain/value-objects/share-code.vo';
import { ShareCollectionDTO } from '../../dtos/share-collection.dto';
import { shareCollectionMapper } from '../../mappers/share-collection.mapper';

export class GenerateShareCodeUseCase {
  constructor(
    private readonly shareRepository: IShareCollectionRepository,
  ) {}

  async execute(userId: string): Promise<ShareCollectionDTO> {
    const existing = await this.shareRepository.getByUser(userId);
    if (existing) {
      return shareCollectionMapper.toDTO(existing);
    }

    const code = ShareCode.generate();
    const shareCollection = ShareCollection.create(userId, code.value);
    await this.shareRepository.save(shareCollection);

    return shareCollectionMapper.toDTO(shareCollection);
  }
}
