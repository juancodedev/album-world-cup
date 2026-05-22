import { IUserCollectionRepository } from '../../../domain/repositories/user-collection.repository';
import { IStickerRepository } from '../../../domain/repositories/sticker.repository';
import { UserCollection } from '../../../domain/entities/user-collection.entity';
import { NotFoundError } from '../../../domain/errors/domain.error';
import { CollectionMapper } from '../../mappers/collection.mapper';
import { UserCollectionDTO } from '../../dtos/user-collection.dto';

export interface AddStickerInput {
  accountId: string;
  userId: string;
  stickerId: string;
  albumId: string;
}

export class AddStickerUseCase {
  constructor(
    private readonly userCollectionRepository: IUserCollectionRepository,
    private readonly stickerRepository: IStickerRepository,
    private readonly mapper: CollectionMapper,
  ) {}

  async execute(input: AddStickerInput): Promise<UserCollectionDTO> {
    const sticker = await this.stickerRepository.getById(input.stickerId);
    if (!sticker) {
      throw new NotFoundError(`Sticker with ID ${input.stickerId} not found`);
    }

    if (sticker.albumId !== input.albumId) {
      throw new Error('Sticker does not belong to this album');
    }

    let userCollection = await this.userCollectionRepository.getByUserAndSticker(
      input.accountId,
      input.userId,
      input.stickerId,
    );

    if (userCollection) {
      userCollection.incrementQuantity();
    } else {
      userCollection = UserCollection.create(input.accountId, input.userId, input.stickerId);
    }

    await this.userCollectionRepository.save(userCollection);
    return this.mapper.toDTO(userCollection);
  }
}
