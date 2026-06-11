export interface ExchangeOfferDTO {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string | null;
  offeredStickerId: string;
  offeredStickerNumber: number;
  offeredStickerImage: string;
  offeredStickerCode: string;
  offeredTeamName: string | null;
  requestedStickerId: string | null;
  requestedStickerNumber: number | null;
  requestedStickerImage: string | null;
  requestedStickerCode: string | null;
  requestedTeamName: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  acceptedByUserId: string | null;
  acceptedByUserName: string | null;
  message: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface CreateExchangeOfferInput {
  offeredStickerId: string;
  requestedStickerId?: string;
  message?: string;
}

export interface ExchangePartnerDTO {
  userId: string;
  userName: string;
  userAvatar: string | null;
  duplicateCount: number;
}
