import { UserCollection } from '../../domain/entities/user-collection.entity';
import { UserCollectionDTO } from '../dtos/user-collection.dto';

export class CollectionMapper {
  toDTO(entity: UserCollection): UserCollectionDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      stickerId: entity.stickerId,
      quantityOwned: entity.quantityOwned,
      obtainedAt: entity.obtainedAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
    };
  }

  fromPersistence(raw: Record<string, unknown>): UserCollection {
    return new UserCollection({
      id: raw.id as string,
      accountId: raw.account_id as string,
      userId: raw.user_id as string,
      stickerId: raw.sticker_id as string,
      quantityOwned: raw.quantity_owned as number,
      obtainedAt: raw.obtained_at ? new Date(raw.obtained_at as string) : undefined,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
    });
  }

  toPersistence(entity: UserCollection): Record<string, unknown> {
    return {
      id: entity.id,
      account_id: entity.accountId,
      user_id: entity.userId,
      sticker_id: entity.stickerId,
      quantity_owned: entity.quantityOwned,
      obtained_at: entity.obtainedAt.toISOString(),
    };
  }
}

export const collectionMapper = new CollectionMapper();
