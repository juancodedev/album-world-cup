import { ExchangeOffer } from '../../domain/entities/exchange-offer.entity';
import { ExchangeOfferDTO } from '../dtos/exchange-offer.dto';

interface ExchangeStickerInfo {
  id: string;
  number: number;
  imageUrl: string;
  imageThumbnail?: string;
  stickerCode?: string;
  teamName?: string | null;
}

interface ExchangeUserInfo {
  id: string;
  name: string;
  avatar: string | null;
}

export class ExchangeMapper {
  static toDTO(
    offer: ExchangeOffer,
    fromUser: ExchangeUserInfo,
    offeredSticker: ExchangeStickerInfo,
    requestedSticker?: ExchangeStickerInfo | null,
    acceptedByUser?: ExchangeUserInfo | null,
    currentUserId?: string,
  ): ExchangeOfferDTO {
    return {
      id: offer.id,
      fromUserId: offer.fromUserId,
      fromUserName: fromUser.name,
      fromUserAvatar: fromUser.avatar,
      offeredStickerId: offer.offeredStickerId,
      offeredStickerNumber: offeredSticker.number,
      offeredStickerImage: offeredSticker.imageThumbnail || offeredSticker.imageUrl,
      offeredStickerCode: offeredSticker.stickerCode || `#${offeredSticker.number}`,
      offeredTeamName: offeredSticker.teamName ?? null,
      requestedStickerId: offer.requestedStickerId ?? null,
      requestedStickerNumber: requestedSticker?.number ?? null,
      requestedStickerImage: requestedSticker?.imageThumbnail || requestedSticker?.imageUrl || null,
      requestedStickerCode: requestedSticker?.stickerCode ?? null,
      requestedTeamName: requestedSticker?.teamName ?? null,
      status: offer.status,
      acceptedByUserId: offer.acceptedBy ?? null,
      acceptedByUserName: acceptedByUser?.name ?? null,
      message: offer.message ?? null,
      createdAt: offer.createdAt.toISOString(),
      isOwn: offer.fromUserId === currentUserId,
    };
  }
}
