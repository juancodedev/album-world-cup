
export interface StickerDTO {
  id: string;
  albumId: string;
  number: number;
  playerId: string | null;
  playerName: string | null;
  teamId: string | null;
  teamName: string | null;
  teamFlag: string | null;
  stickerTypeId: string;
  stickerTypeName: string;
  rarity: string;
  rarityLabel: string;
  imageUrl: string;
  imageThumbnail: string | null;
  isSpecial: boolean;
  specialAttribute: string | null;
  state: 'missing' | 'obtained' | 'duplicate';
  duplicateCount: number;
  createdAt: string;
}

export interface StickerDetailDTO extends StickerDTO {
  playerPosition: string | null;
  playerJerseyNumber: number | null;
  confederation: string | null;
  albumName: string;
}
