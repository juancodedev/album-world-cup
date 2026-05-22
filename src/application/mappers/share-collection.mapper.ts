import { ShareCollection } from '../../domain/entities/share-collection.entity';
import { ShareCollectionDTO } from '../dtos/share-collection.dto';

export class ShareCollectionMapper {
  toDTO(share: ShareCollection, context?: {
    userName?: string;
    userAvatar?: string | null;
    stats?: { total: number; owned: number; missing: number; percentage: number } | null;
  }): ShareCollectionDTO {
    return {
      id: share.id,
      userId: share.userId,
      userName: context?.userName || '',
      userAvatar: context?.userAvatar || null,
      shareCode: share.shareCode,
      isPublic: share.isPublic,
      showDuplicates: share.showDuplicates,
      showMissing: share.showMissing,
      expiresAt: share.expiresAt?.toISOString() || null,
      viewCount: share.viewCount,
      createdAt: share.createdAt.toISOString(),
      stats: context?.stats || null,
    };
  }

  fromPersistence(raw: Record<string, unknown>): ShareCollection {
    return new ShareCollection({
      id: raw.id as string,
      userId: raw.user_id as string,
      shareCode: raw.share_code as string,
      isPublic: raw.is_public as boolean,
      showDuplicates: raw.show_duplicates as boolean,
      showMissing: raw.show_missing as boolean,
      expiresAt: raw.expires_at ? new Date(raw.expires_at as string) : undefined,
      viewCount: raw.view_count as number,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : undefined,
    });
  }
}

export const shareCollectionMapper = new ShareCollectionMapper();
