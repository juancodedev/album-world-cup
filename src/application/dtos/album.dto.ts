export interface AlbumDTO {
  id: string;
  name: string;
  year: number;
  tournamentType: string;
  description: string | null;
  imageUrl: string | null;
  totalStickers: number;
  specialStickers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlbumDTO {
  name: string;
  year: number;
  tournamentType: string;
  description?: string;
  imageUrl?: string;
  totalStickers: number;
  specialStickers?: number;
}
