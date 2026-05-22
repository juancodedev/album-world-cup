export interface TeamDTO {
  id: string;
  albumId: string;
  confederationId: string;
  confederationName: string;
  name: string;
  code: string;
  flagUrl: string | null;
  groupStage: string | null;
  stickerCount: number;
  ownedCount: number;
  progressPercentage: number;
}
