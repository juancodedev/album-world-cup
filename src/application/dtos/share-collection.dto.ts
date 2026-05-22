export interface ShareCollectionDTO {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  shareCode: string;
  isPublic: boolean;
  showDuplicates: boolean;
  showMissing: boolean;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
  stats: {
    total: number;
    owned: number;
    missing: number;
    percentage: number;
  } | null;
}
