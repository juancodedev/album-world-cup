export interface StickerDuplicateDTO {
  id: string;
  userId: string;
  stickerId: string;
  stickerNumber: number;
  stickerImage: string;
  playerName: string | null;
  teamName: string | null;
  quantity: number;
  createdAt: string;
}
