import { IShareCollectionRepository } from '../../../domain/repositories/share-collection.repository';
import { NotFoundError } from '../../../domain/errors/domain.error';
import { ShareCollectionDTO } from '../../dtos/share-collection.dto';
import { shareCollectionMapper } from '../../mappers/share-collection.mapper';

export interface UpdateShareSettingsInput {
  accountId: string;
  userId: string;
  isPublic?: boolean;
  showDuplicates?: boolean;
  showMissing?: boolean;
}

export class UpdateShareSettingsUseCase {
  constructor(private readonly shareRepository: IShareCollectionRepository) {}

  async execute(input: UpdateShareSettingsInput): Promise<ShareCollectionDTO> {
    const share = await this.shareRepository.getByAccount(input.accountId);
    if (!share) throw new NotFoundError('No shared collection found');

    if (input.isPublic !== undefined) share.isPublic = input.isPublic;
    if (input.showDuplicates !== undefined) share.showDuplicates = input.showDuplicates;
    if (input.showMissing !== undefined) share.showMissing = input.showMissing;

    await this.shareRepository.update(share);
    return shareCollectionMapper.toDTO(share);
  }
}
